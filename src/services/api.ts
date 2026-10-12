export interface HealthResponse {
  status: string;
  appName: string;
  geminiConfigured: boolean;
  storageTarget: string;
  supportedModels: Record<string, string>;
}

export interface ChatApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  timestamp: string;
}

export interface ImageResponse {
  imageUrl: string;
  commentary?: string;
  prompt: string;
  aspectRatio: string;
  timestamp: string;
}

export interface StorageStatusResponse {
  targetCapacityGB: number;
  targetCapacityFormatted: string;
  status: string;
  localBrowserCacheActive: boolean;
  localIndexedDBActive: boolean;
  features: string[];
  recommendedProviders: Array<{ name: string; capacity: string; authType: string }>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function sendChatMessage(
  messages: ChatApiMessage[],
  mode: string = 'general',
  language: 'en' | 'bn' = 'en'
): Promise<ChatResponse> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode, language }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate response from AI');
  }
  return data;
}

export async function generateAiImage(
  prompt: string,
  aspectRatio: string = '1:1',
  referenceImage?: string
): Promise<ImageResponse> {
  const res = await fetch('/api/ai/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, referenceImage }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate image');
  }
  return data;
}

export async function transcribeAudio(audioData: string, mimeType = 'audio/webm'): Promise<{ transcript: string }> {
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioData, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to transcribe audio');
  }
  return data;
}

export async function synthesizeSpeech(text: string, voice = 'Kore', style?: string): Promise<{ audioUrl: string }> {
  const res = await fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, style }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to synthesize speech');
  }
  return data;
}

export async function generateAiVideo(
  prompt: string,
  aspectRatio = '16:9',
  resolution = '720p',
  imageBase64?: string
): Promise<{ operationName: string; message: string }> {
  const res = await fetch('/api/ai/video-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, resolution, imageBase64 }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to start video generation');
  }
  return data;
}

export async function checkVideoStatus(operationName: string): Promise<{ done: boolean; error?: any }> {
  const res = await fetch('/api/ai/video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to check status');
  }
  return data;
}

export async function fetchStorageStatus(): Promise<StorageStatusResponse> {
  const res = await fetch('/api/storage/status');
  if (!res.ok) throw new Error('Failed to fetch storage status');
  return res.json();
}

// Authentication & Permanent Database Vault API
export interface AuthUserResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    name: string;
    phone: string;
    secretName?: string;
    plan: string;
    createdAt: string;
    isLoggedIn: boolean;
  };
}

export async function signupUser(params: {
  phone: string;
  password: string;
  secretName: string;
  name?: string;
}): Promise<AuthUserResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'সাইন আপ ব্যর্থ হয়েছে।');
  }
  return data;
}

export async function loginUser(params: {
  phone: string;
  password: string;
}): Promise<AuthUserResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে।');
  }
  return data;
}

export async function resetPasswordWithSecret(params: {
  phone: string;
  secretName: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
  }
  return data;
}

export async function syncVaultToServer(params: {
  phone: string;
  projects?: any[];
  media?: any[];
  inventions?: any[];
}): Promise<{ success: boolean; message: string; timestamp: string }> {
  const res = await fetch('/api/vault/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ডাটাবেস ভল্ট সিঙ্ক ব্যর্থ হয়েছে।');
  }
  return data;
}

export async function restoreVaultFromServer(phone: string): Promise<{
  success: boolean;
  projects: any[];
  media: any[];
  inventions: any[];
}> {
  const res = await fetch(`/api/vault/restore/${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ডাটাবেস ভল্ট রিস্টোর ব্যর্থ হয়েছে।');
  }
  return data;
}
