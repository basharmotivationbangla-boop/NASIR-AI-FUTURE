import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent Server Database Setup
const DATA_DIR = path.resolve(__dirname, 'server_data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VAULTS_DIR = path.join(DATA_DIR, 'vaults');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(VAULTS_DIR)) fs.mkdirSync(VAULTS_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_nasir_ai_salt_2026').digest('hex');
}

function getUsers(): any[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50mb limit for media data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health & Integration Status endpoint
app.get('/api/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    appName: 'NASIR AI FUTURE',
    timestamp: new Date().toISOString(),
    geminiConfigured: isKeyConfigured,
    storageTarget: '2,000 GB (2 TB)',
    environment: process.env.NODE_ENV || 'development',
    supportedModels: {
      chat: 'gemini-3.8-flash',
      reasoning: 'gemini-3.1-pro-preview',
      image: 'gemini-3.1-flash-lite-image',
      tts: 'gemini-3.8-flash-lite-tts',
      transcribe: 'gemini-3.5-transcribe',
      video: 'veo-3.1-lite-generate-preview',
    },
  });
});

// 2. AI Chat & Assistant endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please configure GEMINI_API_KEY in your environment or Secrets panel.',
        code: 'MISSING_API_KEY',
      });
    }

    const { messages, systemInstruction, mode = 'general', language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    // Default specialized system prompts
    let baseInstruction = `You are NASIR AI FUTURE, an advanced, highly knowledgeable, polite, and helpful AI assistant for the NASIR AI FUTURE creative ecosystem. You support both English and Bengali seamlessly. You assist with creative writing, video editing advice, image generation prompts, code implementation, science education, robotics engineering, and invention brainstorming. Always be clear, structured, and practical.`;

    if (language === 'bn') {
      baseInstruction += ` Respond primarily in natural, clear Bengali (বাংলা), keeping technical terms accessible or bilingual where appropriate.`;
    }

    if (systemInstruction) {
      baseInstruction += ` Additional directives: ${systemInstruction}`;
    }

    // Prepare contents
    // Convert conversational history to Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: baseInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    res.json({
      reply: replyText,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response from AI model.',
      code: 'GEMINI_ERROR',
    });
  }
});

// 3. AI Image Generation endpoint
app.post('/api/ai/image', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Configure GEMINI_API_KEY in Secrets panel to generate AI images.',
        code: 'MISSING_API_KEY',
      });
    }

    const { prompt, aspectRatio = '1:1', referenceImage } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const parts: any[] = [];
    if (referenceImage && typeof referenceImage === 'string') {
      // Support base64 image editing/variation
      const cleanBase64 = referenceImage.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = '';
    let commentary = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          commentary += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: 'The model returned text without image data: ' + (commentary || 'No image generated'),
        commentary,
      });
    }

    res.json({
      imageUrl,
      commentary,
      prompt,
      aspectRatio,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/image:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image.',
      code: 'IMAGE_GEN_ERROR',
    });
  }
});

// 4. Speech-to-Text Transcription endpoint
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured for transcription.',
        code: 'MISSING_API_KEY',
      });
    }

    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Base64 audioData is required.' });
    }

    const cleanBase64 = audioData.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this audio verbatim. If spoken in Bengali or English, accurately transcribe the original language.' },
        ],
      },
    });

    res.json({
      transcript: response.text || '',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/transcribe:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio.',
      code: 'TRANSCRIBE_ERROR',
    });
  }
});

// 5. Text-to-Speech endpoint
app.post('/api/ai/tts', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured for text-to-speech.',
        code: 'MISSING_API_KEY',
      });
    }

    const { text, voice = 'Kore', style } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required.' });
    }

    const parts: any[] = [{ text }];
    if (style) {
      parts[0].speechMetadata = { style };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'TTS model did not return audio data.' });
    }

    res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/tts:', error);
    res.status(500).json({
      error: error?.message || 'Failed to synthesize speech.',
      code: 'TTS_ERROR',
    });
  }
});

// 6. AI Video Generation (Veo) 3-step lifecycle
app.post('/api/ai/video-generate', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. AI Video generation requires a configured key.',
        code: 'MISSING_API_KEY',
      });
    }

    const { prompt, aspectRatio = '16:9', resolution = '720p', imageBase64 } = req.body;
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required.' });
    }

    const payload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'Cinematic futuristic visual',
      config: {
        numberOfVideos: 1,
        resolution: resolution === '1080p' ? '1080p' : '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (imageBase64) {
      const clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      payload.image = {
        imageBytes: clean,
        mimeType: 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    res.json({
      operationName: operation.name,
      message: 'Video generation started successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/video-generate:', error);
    res.status(500).json({
      error: error?.message || 'Failed to start video generation.',
      code: 'VIDEO_GEN_ERROR',
    });
  }
});

app.post('/api/ai/video-status', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'API key not configured.' });
    }
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required.' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/video-status:', error);
    res.status(500).json({ error: error?.message || 'Failed to check video status.' });
  }
});

app.post('/api/ai/video-download', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = getGenAIClient();
    if (!ai || !apiKey) {
      return res.status(503).json({ error: 'API key not configured.' });
    }
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or generation not finished.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });
    res.setHeader('Content-Type', 'video/mp4');
    videoRes.body!.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (error: any) {
    console.error('Error in /api/ai/video-download:', error);
    res.status(500).json({ error: error?.message || 'Failed to download video.' });
  }
});

// 7. Cloud Storage Capacity & Management Status endpoint
app.get('/api/storage/status', (req, res) => {
  res.json({
    targetCapacityGB: 2000,
    targetCapacityFormatted: '2,000 GB (2.0 TB)',
    status: 'Setup Required for external object storage provider (e.g. S3 / GCS / Supabase bucket)',
    localBrowserCacheActive: true,
    localIndexedDBActive: true,
    features: [
      'High-speed local IndexedDB caching for active video, audio and image assets',
      'Unified media library with file categorization and search',
      'Configurable S3 / Google Cloud Storage adapter boundary for 2,000 GB target capacity',
      'Export and backup projects to JSON & local disk',
    ],
    recommendedProviders: [
      { name: 'Google Cloud Storage Bucket', capacity: '2 TB+', authType: 'Service Account / OAuth' },
      { name: 'AWS S3 / Wasabi / Cloudflare R2', capacity: '2 TB+', authType: 'S3 API Keys' },
    ],
  });
});

// 8. Authentication: Sign Up with Phone, Password & Secret Name
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, phone, password, secretName } = req.body;
    if (!phone || !password || !secretName) {
      return res.status(400).json({ error: 'মোবাইল নম্বর, পাসওয়ার্ড এবং সিক্রেট নাম অবশ্যই প্রদান করতে হবে।' });
    }

    const cleanPhone = String(phone).trim();
    if (cleanPhone.length < 5) {
      return res.status(400).json({ error: 'সঠিক মোবাইল নম্বর প্রদান করুন।' });
    }

    const users = getUsers();
    const existing = users.find((u) => u.phone === cleanPhone);
    if (existing) {
      return res.status(409).json({ error: 'এই মোবাইল নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।' });
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: (name || 'Nasir Creator').trim(),
      phone: cleanPhone,
      passwordHash: hashPassword(password),
      secretName: String(secretName).trim(),
      plan: 'Pro Studio Creator',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    // Initialize dedicated server vault folder for the user
    const userVaultPath = path.join(VAULTS_DIR, cleanPhone);
    if (!fs.existsSync(userVaultPath)) fs.mkdirSync(userVaultPath, { recursive: true });

    const { passwordHash, ...safeUser } = newUser;
    res.json({
      success: true,
      message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
      user: { ...safeUser, isLoggedIn: true },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err?.message || 'সার্ভার ত্রুটি।' });
  }
});

// 9. Authentication: Login with Phone & Password
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।' });
    }

    const cleanPhone = String(phone).trim();
    const users = getUsers();
    const user = users.find((u) => u.phone === cleanPhone);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় যাচাই করুন।' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({
      success: true,
      message: 'সফলভাবে লগইন হয়েছে।',
      user: { ...safeUser, isLoggedIn: true },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err?.message || 'লগইন ব্যর্থ হয়েছে।' });
  }
});

// 10. Authentication: Password Recovery using Secret Name
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { phone, secretName, newPassword } = req.body;
    if (!phone || !secretName || !newPassword) {
      return res.status(400).json({ error: 'মোবাইল নম্বর, সিক্রেট নাম ও নতুন পাসওয়ার্ড প্রদান করুন।' });
    }

    const cleanPhone = String(phone).trim();
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.phone === cleanPhone);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'এই মোবাইল নম্বরের কোনো অ্যাকাউন্ট ডাটাবেসে পাওয়া যায়নি।' });
    }

    const user = users[userIndex];
    if (String(user.secretName).toLowerCase().trim() !== String(secretName).toLowerCase().trim()) {
      return res.status(403).json({ error: 'সিক্রেট নাম মেলেনি! সঠিক সিক্রেট নাম দিন যা সাইন আপের সময় দিয়েছিলেন।' });
    }

    users[userIndex].passwordHash = hashPassword(newPassword);
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে রিসেট সম্পন্ন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: err?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
  }
});

// 11. Permanent Server Database Vault Sync (Never Lose Files)
app.post('/api/vault/sync', (req, res) => {
  try {
    const { phone, projects, media, inventions } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'User phone number is required for vault synchronization.' });
    }

    const cleanPhone = String(phone).trim();
    const userVaultPath = path.join(VAULTS_DIR, cleanPhone);
    if (!fs.existsSync(userVaultPath)) fs.mkdirSync(userVaultPath, { recursive: true });

    if (projects) {
      fs.writeFileSync(path.join(userVaultPath, 'projects.json'), JSON.stringify(projects, null, 2));
    }
    if (media) {
      fs.writeFileSync(path.join(userVaultPath, 'media.json'), JSON.stringify(media, null, 2));
    }
    if (inventions) {
      fs.writeFileSync(path.join(userVaultPath, 'inventions.json'), JSON.stringify(inventions, null, 2));
    }

    res.json({
      success: true,
      message: 'সকল ফাইল ও প্রজেক্ট সার্ভার ডাটাবেসে স্থায়ীভাবে সংরক্ষিত হয়েছে।',
      timestamp: new Date().toISOString(),
      stats: {
        projectsSaved: projects ? projects.length : 0,
        mediaSaved: media ? media.length : 0,
        inventionsSaved: inventions ? inventions.length : 0,
      },
    });
  } catch (err: any) {
    console.error('Vault sync error:', err);
    res.status(500).json({ error: err?.message || 'সার্ভার ভল্ট সিনক্রোনাইজেশন ব্যর্থ হয়েছে।' });
  }
});

// 12. Permanent Server Database Vault Restore
app.get('/api/vault/restore/:phone', (req, res) => {
  try {
    const cleanPhone = String(req.params.phone).trim();
    const userVaultPath = path.join(VAULTS_DIR, cleanPhone);

    let projects = [];
    let media = [];
    let inventions = [];

    const projFile = path.join(userVaultPath, 'projects.json');
    if (fs.existsSync(projFile)) projects = JSON.parse(fs.readFileSync(projFile, 'utf-8'));

    const mediaFile = path.join(userVaultPath, 'media.json');
    if (fs.existsSync(mediaFile)) media = JSON.parse(fs.readFileSync(mediaFile, 'utf-8'));

    const invFile = path.join(userVaultPath, 'inventions.json');
    if (fs.existsSync(invFile)) inventions = JSON.parse(fs.readFileSync(invFile, 'utf-8'));

    res.json({
      success: true,
      projects,
      media,
      inventions,
    });
  } catch (err: any) {
    console.error('Vault restore error:', err);
    res.status(500).json({ error: err?.message || 'ভল্ট পুনরুদ্ধার ব্যর্থ হয়েছে।' });
  }
});

// Vite Middleware integration for Full-Stack dev mode
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NASIR AI FUTURE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NASIR AI FUTURE] Failed to start server:', err);
});
