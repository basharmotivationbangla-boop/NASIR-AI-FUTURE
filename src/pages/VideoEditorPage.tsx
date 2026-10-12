import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Project, TimelineClip, VideoTrack, VideoProjectData, MediaItem } from '../types';
import { saveProject, getProjects, getMediaItems, saveMediaItem } from '../services/db';
import { renderVideoProject } from '../services/videoRenderer';
import {
  Play,
  Pause,
  Scissors,
  Trash2,
  Copy,
  Plus,
  Download,
  Film,
  Type,
  Music,
  Sliders,
  ZoomIn,
  ZoomOut,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  ChevronLeft,
  Database,
  RefreshCw,
} from 'lucide-react';

export const VideoEditorPage: React.FC = () => {
  const {
    activeProject,
    setActiveProject,
    addNotification,
    language,
    setActiveTab,
    syncVault,
    isSyncing,
  } = useApp();

  // Project state
  const [project, setProject] = useState<Project | null>(activeProject);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(40); // pixels per second
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
  const [duration, setDuration] = useState(15);
  const [libraryMedia, setLibraryMedia] = useState<MediaItem[]>([]);
  const [activeTabPanel, setActiveTabPanel] = useState<'media' | 'text' | 'audio' | 'filters'>('media');

  // Video Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);

  // Canvas preview ref
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or fallback project
  useEffect(() => {
    async function initProject() {
      if (activeProject) {
        setProject(activeProject);
        if (activeProject.data) {
          setDuration(activeProject.data.duration || 15);
          setAspectRatio(activeProject.data.aspectRatio || '16:9');
        }
      } else {
        const projects = await getProjects();
        if (projects.length > 0) {
          setProject(projects[0]);
          setActiveProject(projects[0]);
        }
      }
      const media = await getMediaItems();
      setLibraryMedia(media);
    }
    initProject();
  }, [activeProject]);

  // Project data helper
  const projectData: VideoProjectData = project?.data || {
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    duration: 15,
    tracks: [
      { id: 'track_v1', name: 'Main Video', type: 'video' },
      { id: 'track_t1', name: 'Titles & Text', type: 'text' },
      { id: 'track_a1', name: 'Background Audio', type: 'audio' },
    ],
    clips: [],
  };

  const tracks: VideoTrack[] = projectData.tracks || [];
  const clips: TimelineClip[] = projectData.clips || [];

  const updateClips = (newClips: TimelineClip[]) => {
    if (!project) return;
    const updated: Project = {
      ...project,
      updatedAt: new Date().toISOString(),
      data: {
        ...projectData,
        clips: newClips,
        duration,
        aspectRatio,
      },
    };
    setProject(updated);
    setActiveProject(updated);
    saveProject(updated);
  };

  // Playback timer loop
  useEffect(() => {
    let lastTime = performance.now();
    const tick = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }
      lastTime = now;
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration]);

  // Canvas Realtime Preview Rendering
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution based on aspect ratio
    const width = aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 1080 : 1920;
    const height = aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 1080 : 1080;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Active clips at currentTime
    const active = clips.filter((c) => currentTime >= c.start && currentTime <= c.start + c.duration);

    // Sort: video -> overlay -> text
    const sorted = [...active].sort((a, b) => {
      const order = { video: 1, overlay: 2, text: 3, audio: 0 };
      return (order[a.trackType] || 0) - (order[b.trackType] || 0);
    });

    for (const clip of sorted) {
      ctx.save();
      if (clip.filters) {
        const f = clip.filters;
        ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg)`;
      }

      if (clip.trackType === 'video') {
        // Draw video banner / media frame
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(60, 60, width - 120, height - 120);

        // Glow outline
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.strokeRect(60, 60, width - 120, height - 120);

        ctx.fillStyle = '#c7d2fe';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`▶ CLIP: ${clip.name}`, width / 2, height / 2 - 20);

        const progressPercent = Math.round(((currentTime - clip.start) / clip.duration) * 100);
        ctx.font = '24px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Playing (${progressPercent}%)`, width / 2, height / 2 + 30);
      } else if (clip.trackType === 'text') {
        const style = clip.textStyle || {
          fontSize: 48,
          fontFamily: 'Plus Jakarta Sans',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold',
        };

        const fSize = Math.round(style.fontSize * (width / 1280));
        ctx.font = `${style.fontWeight || 'bold'} ${fSize}px ${style.fontFamily || 'sans-serif'}`;
        ctx.textAlign = style.textAlign || 'center';
        ctx.textBaseline = 'middle';

        const textX = style.textAlign === 'left' ? 120 : style.textAlign === 'right' ? width - 120 : width / 2;
        const textY = height / 2 + 100;

        if (style.backgroundColor) {
          const metrics = ctx.measureText(clip.textContent || '');
          const pad = 24;
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(
            textX - metrics.width / 2 - pad,
            textY - fSize / 2 - pad / 2,
            metrics.width + pad * 2,
            fSize + pad
          );
        }

        ctx.fillStyle = style.color || '#38bdf8';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText(clip.textContent || clip.name, textX, textY);
      }
      ctx.restore();
    }

    // Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('NASIR AI FUTURE • TIMELINE EDITOR', width - 24, height - 20);
  }, [currentTime, clips, aspectRatio]);

  // Selected clip object
  const selectedClip = clips.find((c) => c.id === selectedClipId);

  // Timeline Operations
  const handleAddTextClip = () => {
    const newClip: TimelineClip = {
      id: 'clip_txt_' + Date.now(),
      trackId: 'track_t1',
      trackType: 'text',
      name: 'Title Overlay',
      start: currentTime,
      duration: 3.5,
      sourceStart: 0,
      textContent: language === 'en' ? 'Futuristic Headline' : 'ভবিষ্যৎ প্রজন্মের শিরোনাম',
      textStyle: {
        fontSize: 44,
        fontFamily: 'Plus Jakarta Sans',
        color: '#38bdf8',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        textAlign: 'center',
        fontWeight: 'bold',
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 },
    };
    updateClips([...clips, newClip]);
    setSelectedClipId(newClip.id);
    addNotification('Text Clip Added', 'Text layer placed on timeline', 'info');
  };

  const handleAddAudioClip = () => {
    const newClip: TimelineClip = {
      id: 'clip_aud_' + Date.now(),
      trackId: 'track_a1',
      trackType: 'audio',
      name: 'Ambient Cyber Beat',
      start: currentTime,
      duration: 6,
      sourceStart: 0,
      volume: 0.8,
    };
    updateClips([...clips, newClip]);
    setSelectedClipId(newClip.id);
    addNotification('Audio Track Added', 'Soundtrack placed on timeline', 'info');
  };

  const handleSplitClip = () => {
    if (!selectedClip) {
      addNotification('No Clip Selected', 'Click a clip on the timeline to split at playhead', 'warning');
      return;
    }

    if (currentTime <= selectedClip.start || currentTime >= selectedClip.start + selectedClip.duration) {
      addNotification('Playhead Out of Range', 'Move the playhead inside the selected clip to split', 'warning');
      return;
    }

    const firstDuration = currentTime - selectedClip.start;
    const secondDuration = selectedClip.duration - firstDuration;

    const clip1: TimelineClip = {
      ...selectedClip,
      duration: firstDuration,
    };

    const clip2: TimelineClip = {
      ...selectedClip,
      id: 'clip_' + Date.now(),
      start: currentTime,
      duration: secondDuration,
      sourceStart: selectedClip.sourceStart + firstDuration,
      name: `${selectedClip.name} (Part 2)`,
    };

    const nextClips = clips.filter((c) => c.id !== selectedClip.id).concat([clip1, clip2]);
    updateClips(nextClips);
    setSelectedClipId(clip2.id);
    addNotification('Clip Split', 'Segmented clip into two parts', 'success');
  };

  const handleDeleteClip = () => {
    if (!selectedClipId) return;
    const nextClips = clips.filter((c) => c.id !== selectedClipId);
    updateClips(nextClips);
    setSelectedClipId(null);
    addNotification('Clip Deleted', 'Clip removed from timeline', 'info');
  };

  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    const dup: TimelineClip = {
      ...selectedClip,
      id: 'clip_' + Date.now(),
      start: selectedClip.start + selectedClip.duration + 0.2,
      name: `${selectedClip.name} (Copy)`,
    };
    updateClips([...clips, dup]);
    setSelectedClipId(dup.id);
    addNotification('Clip Duplicated', 'Duplicated clip on timeline', 'info');
  };

  // Import Media File from local computer
  const handleImportMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');
    const isImage = file.type.startsWith('image');

    const mediaItem: MediaItem = {
      id: 'med_' + Date.now(),
      name: file.name,
      type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
      url,
      size: file.size,
      blob: file,
      createdAt: new Date().toISOString(),
    };

    await saveMediaItem(mediaItem);
    setLibraryMedia((prev) => [mediaItem, ...prev]);

    // Place on timeline
    const targetTrackId = isVideo ? 'track_v1' : isAudio ? 'track_a1' : 'track_t1';
    const targetTrackType = isVideo ? 'video' : isAudio ? 'audio' : 'overlay';

    const newClip: TimelineClip = {
      id: 'clip_' + Date.now(),
      trackId: targetTrackId,
      trackType: targetTrackType,
      name: file.name,
      mediaId: mediaItem.id,
      mediaUrl: url,
      start: currentTime,
      duration: isVideo || isAudio ? 6 : 4,
      sourceStart: 0,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 },
    };

    updateClips([...clips, newClip]);
    setSelectedClipId(newClip.id);
    addNotification('Media Imported', `Added "${file.name}" to timeline`, 'success');
  };

  // Real Video Export Execution
  const handleExportVideo = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportStage('Initializing video rendering engine...');
      setExportedVideoUrl(null);

      const width = aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 1080 : 1280;
      const height = aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 1080 : 720;

      const result = await renderVideoProject(
        {
          aspectRatio,
          width,
          height,
          duration,
          tracks,
          clips,
        },
        {
          fps: 25,
          onProgress: (p, stage) => {
            setExportProgress(p);
            setExportStage(stage);
          },
        }
      );

      setExportedVideoBlob(result.blob);
      setExportedVideoUrl(result.url);
      addNotification('Video Render Complete!', 'Your exported video is ready to download.', 'success');
    } catch (err: any) {
      console.error('Export failed:', err);
      addNotification('Export Failed', err?.message || 'Video export encountered an error.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* 1. Top Editor Toolbar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <input
              type="text"
              value={project?.name || 'Untitled Video Project'}
              onChange={(e) => {
                if (!project) return;
                const updated = { ...project, name: e.target.value };
                setProject(updated);
                saveProject(updated);
              }}
              className="bg-transparent font-bold text-xs sm:text-sm text-slate-100 border-b border-transparent hover:border-slate-700 focus:border-sky-500 focus:outline-none px-1"
            />
          </div>
          <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            Auto-Saved
          </span>
          <button
            onClick={() => syncVault()}
            disabled={isSyncing}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Permanent Database Vault: Click to sync & safeguard project"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{isSyncing ? 'Syncing...' : 'DB Vault'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* Aspect Ratio & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-xs">
            {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Video'}</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Area: Left Inspector / Media Library + Right Preview Monitor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Media Library & Clip Inspector Drawer */}
        <div className="w-72 md:w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTabPanel('media')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                activeTabPanel === 'media'
                  ? 'border-sky-400 text-sky-300 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTabPanel('text')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                activeTabPanel === 'text'
                  ? 'border-sky-400 text-sky-300 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Titles
            </button>
            <button
              onClick={() => setActiveTabPanel('filters')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                activeTabPanel === 'filters'
                  ? 'border-sky-400 text-sky-300 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Inspector
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {activeTabPanel === 'media' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportMedia}
                  accept="video/*,audio/*,image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/10 text-indigo-300 text-xs font-semibold transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Local Media File</span>
                </button>

                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Media Library Items
                </div>
                {libraryMedia.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No imported media yet. Click above to upload videos, audio or photos.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {libraryMedia.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-200 truncate">{m.name}</div>
                          <div className="text-[10px] text-slate-300 uppercase font-mono">{m.type} • {(m.size / (1024 * 1024)).toFixed(1)}MB</div>
                        </div>
                        <button
                          onClick={() => {
                            const newClip: TimelineClip = {
                              id: 'clip_' + Date.now(),
                              trackId: m.type === 'video' ? 'track_v1' : m.type === 'audio' ? 'track_a1' : 'track_t1',
                              trackType: m.type === 'video' ? 'video' : m.type === 'audio' ? 'audio' : 'overlay',
                              name: m.name,
                              mediaUrl: m.url,
                              start: currentTime,
                              duration: 5,
                              sourceStart: 0,
                            };
                            updateClips([...clips, newClip]);
                            setSelectedClipId(newClip.id);
                          }}
                          className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[10px] font-bold shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTabPanel === 'text' && (
              <div className="space-y-3">
                <button
                  onClick={handleAddTextClip}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-semibold hover:bg-sky-500/25 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <span>+ Add New Text Title</span>
                </button>

                <div className="text-[11px] text-slate-300">
                  Click "+ Add New Text Title" to place a subtitle or header onto the text timeline at playhead.
                </div>
              </div>
            )}

            {activeTabPanel === 'filters' && (
              <div className="space-y-4">
                {selectedClip ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-sky-400 truncate">
                        {selectedClip.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedClip.trackType}
                      </span>
                    </div>

                    {/* If Text Clip */}
                    {selectedClip.trackType === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300">Text Content</label>
                          <input
                            type="text"
                            value={selectedClip.textContent || ''}
                            onChange={(e) => {
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id ? { ...c, textContent: e.target.value } : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-300">Font Size ({selectedClip.textStyle?.fontSize || 44}px)</label>
                          <input
                            type="range"
                            min="16"
                            max="96"
                            value={selectedClip.textStyle?.fontSize || 44}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? {
                                      ...c,
                                      textStyle: { ...(c.textStyle || { fontFamily: 'sans-serif', color: '#fff', textAlign: 'center', fontWeight: 'bold' }), fontSize: val },
                                    }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full mt-1 accent-sky-400"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-slate-300">Color:</label>
                          <input
                            type="color"
                            value={selectedClip.textStyle?.color || '#38bdf8'}
                            onChange={(e) => {
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? {
                                      ...c,
                                      textStyle: { ...(c.textStyle || { fontSize: 44, fontFamily: 'sans-serif', textAlign: 'center', fontWeight: 'bold' }), color: e.target.value },
                                    }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-8 h-8 rounded bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Color Filters */}
                    {selectedClip.filters && (
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                          Color Grading & FX
                        </div>

                        {/* Brightness */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>Brightness</span>
                            <span>{selectedClip.filters.brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="180"
                            value={selectedClip.filters.brightness}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? { ...c, filters: { ...c.filters!, brightness: val } }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full accent-sky-400"
                          />
                        </div>

                        {/* Contrast */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>Contrast</span>
                            <span>{selectedClip.filters.contrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="180"
                            value={selectedClip.filters.contrast}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? { ...c, filters: { ...c.filters!, contrast: val } }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full accent-sky-400"
                          />
                        </div>

                        {/* Saturation */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>Saturation</span>
                            <span>{selectedClip.filters.saturation}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={selectedClip.filters.saturation}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? { ...c, filters: { ...c.filters!, saturation: val } }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full accent-sky-400"
                          />
                        </div>

                        {/* Blur */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>Blur FX</span>
                            <span>{selectedClip.filters.blur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={selectedClip.filters.blur}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const updated = clips.map((c) =>
                                c.id === selectedClip.id
                                  ? { ...c, filters: { ...c.filters!, blur: val } }
                                  : c
                              );
                              updateClips(updated);
                            }}
                            className="w-full accent-sky-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    Select any clip on the timeline below to inspect and customize properties.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Preview Monitor */}
        <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 overflow-hidden">
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {/* Aspect-Ratio Canvas Container */}
            <div
              className={`relative bg-black rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-center overflow-hidden transition-all ${
                aspectRatio === '9:16'
                  ? 'h-full aspect-[9/16]'
                  : aspectRatio === '1:1'
                  ? 'h-full aspect-square'
                  : 'w-full max-w-4xl aspect-[16/9]'
              }`}
            >
              <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Monitor Playback Controls Bar */}
          <div className="h-14 mt-2 flex items-center justify-between px-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTime(0)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Rewind to Start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="font-mono text-xs text-sky-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {formatTimecode(currentTime)} / {formatTimecode(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSplitClip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                title="Split clip at playhead"
              >
                <Scissors className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={handleDuplicateClip}
                disabled={!selectedClipId}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
                title="Duplicate clip"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDeleteClip}
                disabled={!selectedClipId}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-200 transition-colors disabled:opacity-40"
                title="Delete clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Multi-Track Timeline (CapCut Layout) */}
      <div className="h-60 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0">
        {/* Timeline Header Controls */}
        <div className="h-9 px-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300 font-mono text-[11px]">TIMELINE TRACKS</span>
            <button
              onClick={handleAddTextClip}
              className="flex items-center gap-1 hover:text-sky-300 transition-colors"
            >
              <Type className="w-3.5 h-3.5" /> + Text
            </button>
            <button
              onClick={handleAddAudioClip}
              className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
            >
              <Music className="w-3.5 h-3.5" /> + Audio
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5 cursor-pointer hover:text-slate-200" onClick={() => setZoomLevel(Math.max(15, zoomLevel - 10))} />
              <input
                type="range"
                min="15"
                max="100"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
                className="w-20 accent-sky-400 h-1"
              />
              <ZoomIn className="w-3.5 h-3.5 cursor-pointer hover:text-slate-200" onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))} />
            </div>
            <span className="font-mono text-[11px] text-slate-400">{duration}s duration</span>
          </div>
        </div>

        {/* Tracks & Clips Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-950/80 p-2">
          {/* Playhead Vertical Line */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${currentTime * zoomLevel + 160}px` }}
          >
            <div className="w-3.5 h-3.5 bg-rose-500 rounded-sm rotate-45 -mt-1 shadow-md shadow-rose-500/50" />
            <div className="w-0.5 h-full bg-rose-500 shadow" />
          </div>

          {/* Track Rows */}
          <div className="space-y-2 min-w-[1200px]">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center h-12 rounded-xl bg-slate-900/60 border border-slate-800/80 relative">
                {/* Track Header Label */}
                <div className="w-36 px-3 border-r border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 h-full rounded-l-xl">
                  <span className="text-xs font-semibold text-slate-300 truncate">{track.name}</span>
                  {track.type === 'video' && <Film className="w-3.5 h-3.5 text-indigo-400" />}
                  {track.type === 'text' && <Type className="w-3.5 h-3.5 text-sky-400" />}
                  {track.type === 'audio' && <Music className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                {/* Track Clips Container */}
                <div
                  className="flex-1 h-full relative cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newT = Math.max(0, Math.min(duration, clickX / zoomLevel));
                    setCurrentTime(newT);
                  }}
                >
                  {clips
                    .filter((c) => c.trackId === track.id)
                    .map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const leftPx = clip.start * zoomLevel;
                      const widthPx = Math.max(30, clip.duration * zoomLevel);

                      const clipStyles = {
                        video: 'from-indigo-600/60 to-purple-700/60 border-indigo-400/50 text-indigo-100',
                        text: 'from-sky-600/60 to-blue-700/60 border-sky-400/50 text-sky-100',
                        audio: 'from-emerald-600/60 to-teal-700/60 border-emerald-400/50 text-emerald-100',
                        overlay: 'from-pink-600/60 to-rose-700/60 border-pink-400/50 text-pink-100',
                      };

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClipId(clip.id);
                            setActiveTabPanel('filters');
                          }}
                          className={`absolute top-1 bottom-1 rounded-lg border bg-gradient-to-r px-2 flex items-center justify-between text-xs cursor-pointer select-none transition-all ${
                            clipStyles[clip.trackType]
                          } ${isSelected ? 'ring-2 ring-white shadow-lg shadow-sky-500/30' : 'opacity-90'}`}
                          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        >
                          <span className="font-bold truncate text-[11px] leading-tight">
                            {clip.textContent || clip.name}
                          </span>
                          <span className="text-[9px] font-mono opacity-70 shrink-0 ml-1">
                            {clip.duration.toFixed(1)}s
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Exporting Progress & Result Modal */}
      {(isExporting || exportedVideoUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
            {isExporting ? (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-sky-400 animate-pulse">
                  <Film className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rendering Video Composition</h3>
                  <p className="text-xs text-slate-300 mt-1">{exportStage}</p>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-sky-400 font-bold">{exportProgress}% Completed</div>
              </div>
            ) : exportedVideoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-white">Video Export Ready!</h3>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                  <video src={exportedVideoUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Format: WebM / H.264 Compatible</span>
                  <span>Size: {exportedVideoBlob ? (exportedVideoBlob.size / (1024 * 1024)).toFixed(2) : 0} MB</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setExportedVideoUrl(null);
                      setExportedVideoBlob(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Close
                  </button>
                  <a
                    href={exportedVideoUrl}
                    download={`${project?.name || 'nasir_ai_video'}.webm`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video File</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
