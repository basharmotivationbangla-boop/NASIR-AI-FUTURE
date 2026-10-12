import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { saveMediaItem } from '../services/db';
import { MediaItem } from '../types';
import {
  Camera,
  Video,
  Monitor,
  Square,
  Play,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const MediaCapturePage: React.FC = () => {
  const { language, addNotification, setActiveTab } = useApp();

  const [activeMode, setActiveMode] = useState<'camera' | 'screen'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Results
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const stopAllTracks = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsRecordingVideo(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  // Start Camera Stream
  const handleStartCamera = async () => {
    stopAllTracks();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      activeStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setIsCameraActive(true);
      setActiveMode('camera');
      addNotification('Camera Active', 'Live camera stream connected.', 'info');
    } catch (err: any) {
      console.error('Camera access error:', err);
      addNotification('Camera Error', 'Could not open camera: ' + err?.message, 'error');
    }
  };

  // Start Screen Stream
  const handleStartScreen = async () => {
    stopAllTracks();
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      activeStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setIsCameraActive(true);
      setActiveMode('screen');
      addNotification('Screen Capture Active', 'Select screen or window shared.', 'info');
    } catch (err: any) {
      console.error('Screen capture error:', err);
      addNotification('Screen Error', 'Screen recording not started: ' + err?.message, 'error');
    }
  };

  // Take Snapshot Photo
  const handleTakePhoto = () => {
    const video = videoPreviewRef.current;
    if (!video || !isCameraActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhotoUrl(dataUrl);
    addNotification('Photo Captured', 'High-resolution snapshot taken.', 'success');
  };

  // Start Video Recording from live stream
  const handleStartVideoRecording = () => {
    if (!activeStreamRef.current || !isCameraActive) return;

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(activeStreamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4',
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoBlob(blob);
      setRecordedVideoUrl(url);
    };

    recorder.start(100);
    setIsRecordingVideo(true);
    setRecordingSeconds(0);
    setRecordedVideoUrl(null);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    addNotification('Recording Video', 'Live stream recording in progress.', 'info');
  };

  const handleStopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      addNotification('Video Recording Stopped', 'Video clip captured successfully.', 'success');
    }
  };

  const handleSavePhotoToLibrary = async () => {
    if (!capturedPhotoUrl) return;
    const item: MediaItem = {
      id: 'med_snap_' + Date.now(),
      name: `Camera_Snapshot_${Date.now()}.png`,
      type: 'image',
      url: capturedPhotoUrl,
      size: Math.round(capturedPhotoUrl.length * 0.75),
      createdAt: new Date().toISOString(),
    };
    await saveMediaItem(item);
    addNotification('Photo Saved', 'Snapshot saved to unified media library.', 'success');
  };

  const handleSaveVideoToLibrary = async () => {
    if (!recordedVideoUrl || !recordedVideoBlob) return;
    const item: MediaItem = {
      id: 'med_rec_vid_' + Date.now(),
      name: `Capture_Video_${Date.now()}.webm`,
      type: 'video',
      url: recordedVideoUrl,
      size: recordedVideoBlob.size,
      blob: recordedVideoBlob,
      createdAt: new Date().toISOString(),
      duration: recordingSeconds,
    };
    await saveMediaItem(item);
    addNotification('Video Saved', 'Recording added to media library and video editor.', 'success');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Camera className="w-7 h-7 text-pink-400" />
          <span>Camera & Media Capture Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Capture photos, record live camera clips, or stream your screen with browser hardware acceleration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Capture Monitor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            {/* Mode selection buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartCamera}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isCameraActive && activeMode === 'camera'
                      ? 'bg-pink-600 text-white font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Webcam Studio</span>
                </button>
                <button
                  onClick={handleStartScreen}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isCameraActive && activeMode === 'screen'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Screen Recorder</span>
                </button>
              </div>

              {isCameraActive && (
                <button
                  onClick={stopAllTracks}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Stop Stream
                </button>
              )}
            </div>

            {/* Video Viewport */}
            <div className="w-full aspect-video rounded-2xl bg-black border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${!isCameraActive ? 'hidden' : ''}`}
              />

              {!isCameraActive && (
                <div className="text-center space-y-2 p-6 text-slate-400">
                  <Camera className="w-12 h-12 text-slate-700 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">
                    Camera & Screen Studio Offline
                  </div>
                  <div className="text-xs">
                    Click "Webcam Studio" or "Screen Recorder" above to initialize your stream.
                  </div>
                </div>
              )}

              {isRecordingVideo && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-mono font-bold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>RECORDING {formatTimer(recordingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            {isCameraActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleTakePhoto}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo Snapshot</span>
                </button>

                {!isRecordingVideo ? (
                  <button
                    onClick={handleStartVideoRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Record Video Clip</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopVideoRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Captures Drawer */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Captured Assets</span>
            </div>

            {/* Photo Result */}
            {capturedPhotoUrl ? (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-bold text-pink-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Captured Snapshot
                </div>
                <img
                  src={capturedPhotoUrl}
                  alt="Snapshot"
                  className="w-full aspect-video rounded-xl object-cover border border-slate-800"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleSavePhotoToLibrary}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Library
                  </button>
                  <a
                    href={capturedPhotoUrl}
                    download={`snapshot_${Date.now()}.png`}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            ) : null}

            {/* Video Result */}
            {recordedVideoUrl ? (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recorded Video Clip
                </div>
                <video
                  src={recordedVideoUrl}
                  controls
                  className="w-full aspect-video rounded-xl object-contain border border-slate-800"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleSaveVideoToLibrary}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" /> Save to Library
                  </button>
                  <button
                    onClick={() => setActiveTab('video-editor')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Edit in CapCut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}

            {!capturedPhotoUrl && !recordedVideoUrl && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No captures recorded in this session yet. Take a snapshot or record a video on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
