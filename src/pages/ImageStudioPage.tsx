import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateAiImage } from '../services/api';
import { saveMediaItem } from '../services/db';
import { MediaItem } from '../types';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RotateCw,
  Sliders,
  Type,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Crop,
  Copy,
  Maximize2,
} from 'lucide-react';

export const ImageStudioPage: React.FC = () => {
  const { language, addNotification } = useApp();

  // Generator State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [stylePreset, setStylePreset] = useState('Cyberpunk Neon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editor State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [overlayText, setOverlayText] = useState('');
  const [overlayTextColor, setOverlayTextColor] = useState('#ffffff');
  const [overlayTextSize, setOverlayTextSize] = useState(36);

  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const stylePresets = [
    'Cyberpunk Neon',
    'Cinematic 8K Futuristic',
    'Sci-Fi Concept Art',
    'Photorealistic Portrait',
    'Retro Wave Synth',
    'Anime / Manga Masterpiece',
    '3D Blender Octane Render',
  ];

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);

    const fullPrompt = `${prompt}, in ${stylePreset} style, ultra detailed, award winning high resolution digital art`;

    try {
      const res = await generateAiImage(fullPrompt, aspectRatio);
      setGeneratedImage(res.imageUrl);
      setCurrentImage(res.imageUrl);
      addNotification('AI Image Generated', 'Image successfully synthesized via Gemini.', 'success');
    } catch (err: any) {
      console.error('Image gen error:', err);
      setErrorMessage(err?.message || 'Failed to generate image.');
      addNotification('Image Generation Error', err?.message || 'Could not synthesize image', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToMediaLibrary = async () => {
    const imgUrl = currentImage || generatedImage;
    if (!imgUrl) return;

    const mediaItem: MediaItem = {
      id: 'med_img_' + Date.now(),
      name: `AI_Image_${Date.now()}.png`,
      type: 'image',
      url: imgUrl,
      size: Math.round(imgUrl.length * 0.75), // approximate base64 bytes
      createdAt: new Date().toISOString(),
    };

    await saveMediaItem(mediaItem);
    addNotification('Saved to Media Library', 'Image is now available in your media manager and video editor.', 'success');
  };

  // Re-render editor canvas when filters/rotations change
  useEffect(() => {
    if (!currentImage) return;

    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.save();
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%)`;

      // Transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Overlay text
      if (overlayText.trim()) {
        ctx.save();
        ctx.font = `bold ${overlayTextSize * 2}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = overlayTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(overlayText, canvas.width / 2, canvas.height - 40);
        ctx.restore();
      }
    };
  }, [currentImage, rotation, brightness, contrast, saturation, blur, grayscale, overlayText, overlayTextColor, overlayTextSize]);

  const handleDownloadCanvas = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `nasir_ai_studio_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-violet-400" />
            <span>AI Image Studio & Graphic Design</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Synthesize ultra-high-definition artwork with Gemini, customize layouts, and design posters or video thumbnails.
          </p>
        </div>

        {currentImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToMediaLibrary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>Save to Library</span>
            </button>
            <button
              onClick={handleDownloadCanvas}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting & Generation Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Text-to-Image Prompt</span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create (e.g. A neon cybernetic tiger walking down a rain-soaked Tokyo alleyway with holographic billboards in 2049)..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
            />

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      aspectRatio === r
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Style Preset
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stylePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setStylePreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      stylePreset === preset
                        ? 'bg-violet-600/30 border border-violet-500 text-violet-200 font-semibold'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateImage}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-600 to-sky-500 hover:from-violet-400 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Image</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Canvas Editor & Image Preview */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Canvas Preview & Inspector</span>
              </span>
              {currentImage && (
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
              )}
            </div>

            {/* Canvas Viewport */}
            <div className="w-full aspect-square sm:aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
              {currentImage ? (
                <canvas ref={editorCanvasRef} className="max-w-full max-h-full object-contain" />
              ) : isGenerating ? (
                <div className="text-center space-y-3 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center mx-auto text-violet-400 animate-pulse">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="text-sm font-bold text-slate-200">Generating Artwork...</div>
                  <div className="text-xs text-slate-300">
                    Applying "{stylePreset}" styling with Gemini 3.1 Flash Image model.
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 p-6 text-slate-400">
                  <ImageIcon className="w-10 h-10 text-slate-700 mx-auto" />
                  <div className="text-xs">
                    Enter a prompt on the left and click "Generate AI Image" to render here.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Graphic Editor Controls */}
            {currentImage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Poster Headline Overlay
                    </label>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Add banner text or title..."
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Font Size</span>
                        <span>{overlayTextSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={overlayTextSize}
                        onChange={(e) => setOverlayTextSize(parseInt(e.target.value, 10))}
                        className="w-full accent-sky-400"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-300 block mb-1">Color</span>
                      <input
                        type="color"
                        value={overlayTextColor}
                        onChange={(e) => setOverlayTextColor(e.target.value)}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
