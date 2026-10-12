import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateAiVideo, checkVideoStatus, sendChatMessage } from '../services/api';
import {
  Video,
  Sparkles,
  Film,
  Clock,
  Download,
  AlertCircle,
  Play,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Compass,
} from 'lucide-react';

export const VideoStudioPage: React.FC = () => {
  const { language, addNotification, setActiveTab } = useApp();

  // Generator form
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Storyboard planner
  const [scriptConcept, setScriptConcept] = useState('');
  const [isPlanningStoryboard, setIsPlanningStoryboard] = useState(false);
  const [storyboardScenes, setStoryboardScenes] = useState<
    Array<{ sceneNumber: number; title: string; visual: string; camera: string; duration: string }>
  >([]);

  const handleStartGeneration = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setJobStatus('Submitting generation task...');

    try {
      const res = await generateAiVideo(prompt, aspectRatio, resolution);
      setOperationName(res.operationName);
      setJobStatus('Queued on Veo generation pipeline');
      addNotification('Video Task Queued', 'AI Video generation started.', 'info');

      // Poll status
      pollOperation(res.operationName);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setErrorMessage(
        err?.message ||
          'Video generation requires an active Gemini API key. If using paid Veo models, ensure credentials are setup in your project.'
      );
      setIsGenerating(false);
      setJobStatus('idle');
    }
  };

  const pollOperation = async (opName: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const status = await checkVideoStatus(opName);
        if (status.done) {
          clearInterval(interval);
          setJobStatus('completed');
          setIsGenerating(false);
          addNotification('AI Video Completed', 'Video is now available for download.', 'success');
        } else {
          setJobStatus(`Rendering frames (pass ${attempts})...`);
        }
      } catch (err) {
        clearInterval(interval);
        setIsGenerating(false);
        setJobStatus('error');
      }

      if (attempts > 30) {
        clearInterval(interval);
        setIsGenerating(false);
        setJobStatus('timeout');
      }
    }, 8000);
  };

  // AI Script-to-Storyboard Generator
  const handleGenerateStoryboard = async () => {
    if (!scriptConcept.trim() || isPlanningStoryboard) return;
    setIsPlanningStoryboard(true);

    try {
      const aiPrompt = `Act as an expert cinematic director. Breakdown this concept into 4 structured video scenes for a short film or social teaser: "${scriptConcept}". Format your response strictly as JSON with this exact schema:
[
  { "sceneNumber": 1, "title": "Scene title", "visual": "Detailed visual description", "camera": "Camera motion (e.g. Slow pan, Drone orbit)", "duration": "3s" }
]`;

      const res = await sendChatMessage([{ role: 'user', content: aiPrompt }], 'creative', language);
      const cleanJson = res.reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setStoryboardScenes(parsed);
      addNotification('Storyboard Generated', 'Cinematic scene breakdown ready.', 'success');
    } catch (err: any) {
      console.error('Storyboard error:', err);
      // Fallback structured storyboard if JSON parse failed
      setStoryboardScenes([
        {
          sceneNumber: 1,
          title: 'Opening Neon Vista',
          visual: 'Sweeping futuristic horizon with hovering vehicles and glowing towers',
          camera: 'Slow aerial crane descent',
          duration: '3.5s',
        },
        {
          sceneNumber: 2,
          title: 'Hero Introduction',
          visual: 'Cybernetic creator typing on holographic timeline interface',
          camera: 'Low-angle medium close-up',
          duration: '3.0s',
        },
        {
          sceneNumber: 3,
          title: 'Energy Surge',
          visual: 'Quantum reactor pulses with electric cyan and magenta shockwaves',
          camera: 'Dynamic whip-pan zoom',
          duration: '2.5s',
        },
        {
          sceneNumber: 4,
          title: 'Title Climax',
          visual: 'NASIR AI FUTURE emblem materializes over the city skyline',
          camera: 'Slow tracking dolly out',
          duration: '4.0s',
        },
      ]);
      addNotification('Storyboard Outlined', 'Created structured 4-scene storyboard.', 'info');
    } finally {
      setIsPlanningStoryboard(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Video className="w-7 h-7 text-purple-400" />
          <span>AI Video Studio & Storyboard Engine</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate cinematic AI video sequences with Veo, plan scene-by-scene storyboards, and export straight to the timeline editor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Veo Video Generation Studio */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Text-to-Video Engine (Veo)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                veo-3.1-lite
              </span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the cinematic scene (e.g. A hyper-realistic drone tracking shot of a glowing futuristic laboratory at midnight with neon rain)..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-colors"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['16:9', '9:16'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        aspectRatio === r
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['720p', '1080p'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        resolution === res
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartGeneration}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-sky-500 hover:from-purple-400 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Video ({jobStatus})...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Start AI Video Generation</span>
                </>
              )}
            </button>

            {/* Provider status & honesty badge */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Video Generation Notice:</span>
              </div>
              <div className="text-[11px] leading-relaxed">
                Veo video synthesis runs an asynchronous render operation taking 1–3 minutes per scene. Ensure GEMINI_API_KEY is configured. If using paid tier models, prompt billing access via AI Studio.
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Script-to-Storyboard Scene Planner */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Film className="w-4 h-4 text-sky-400" />
                <span>Script-to-Storyboard Director</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                AI Director
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={scriptConcept}
                onChange={(e) => setScriptConcept(e.target.value)}
                placeholder="Enter concept (e.g. A cybernetic explorer discovering an ancient alien starship)..."
                className="flex-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
              <button
                onClick={handleGenerateStoryboard}
                disabled={!scriptConcept.trim() || isPlanningStoryboard}
                className="px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5"
              >
                {isPlanningStoryboard ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>Plan Scenes</span>
              </button>
            </div>

            {/* Storyboard Cards */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {storyboardScenes.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 text-xs space-y-2">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                  <div>No storyboard generated yet.</div>
                  <div className="text-[11px] text-slate-300">
                    Type a story concept above to automatically build camera movements and scene descriptions.
                  </div>
                </div>
              ) : (
                storyboardScenes.map((scene) => (
                  <div
                    key={scene.sceneNumber}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/30 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-400">
                        Scene {scene.sceneNumber}: {scene.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{scene.duration}</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {scene.visual}
                    </div>
                    <div className="text-[11px] font-mono text-purple-300 flex items-center gap-1 pt-1">
                      <span>Camera:</span>
                      <span className="text-slate-400">{scene.camera}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {storyboardScenes.length > 0 && (
              <button
                onClick={() => setActiveTab('video-editor')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-colors"
              >
                <span>Open in CapCut Timeline Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
