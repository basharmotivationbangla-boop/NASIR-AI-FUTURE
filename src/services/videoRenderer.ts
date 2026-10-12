import { VideoProjectData, TimelineClip } from '../types';

export interface RenderOptions {
  fps?: number;
  width?: number;
  height?: number;
  onProgress?: (progress: number, stage: string) => void;
}

export async function renderVideoProject(
  projectData: VideoProjectData,
  options: RenderOptions = {}
): Promise<{ blob: Blob; url: string; size: number }> {
  const fps = options.fps || 30;
  const width = options.width || projectData.width || 1280;
  const height = options.height || projectData.height || 720;
  const duration = Math.max(1, projectData.duration || 5);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available on this browser.');
  }

  // Pre-load image/video elements for clips
  const mediaElements = new Map<string, HTMLImageElement | HTMLVideoElement | HTMLAudioElement>();

  options.onProgress?.(5, 'Preloading timeline media assets...');

  for (const clip of projectData.clips) {
    if (clip.mediaUrl) {
      if (clip.trackType === 'video') {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = clip.mediaUrl;
        video.muted = true;
        await new Promise<void>((resolve) => {
          video.onloadeddata = () => resolve();
          video.onerror = () => resolve(); // continue even if one fails
          setTimeout(resolve, 2000); // timeout fail-safe
        });
        mediaElements.set(clip.id, video);
      } else if (clip.trackType === 'overlay' && clip.mediaUrl.startsWith('data:image') || clip.mediaUrl.endsWith('.png') || clip.mediaUrl.endsWith('.jpg')) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.mediaUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 1500);
        });
        mediaElements.set(clip.id, img);
      }
    }
  }

  // Determine supported mimeType
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  let selectedMimeType = '';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  if (!selectedMimeType) {
    throw new Error('MediaRecorder video encoding is not supported in this browser environment.');
  }

  // Audio setup
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      audioDestination = audioContext.createMediaStreamDestination();
    }
  } catch (err) {
    console.warn('AudioContext not available, continuing video-only render:', err);
  }

  // Get stream from canvas
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

  if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
    audioDestination.stream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 4_000_000, // 4 Mbps high quality
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const renderCompletePromise = new Promise<{ blob: Blob; url: string; size: number }>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: selectedMimeType });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url, size: blob.size });
    };
    recorder.onerror = (e) => reject(new Error('MediaRecorder error: ' + (e as any).error));
  });

  recorder.start(100); // chunk every 100ms

  // Frame by frame rendering loop
  const totalFrames = Math.ceil(duration * fps);
  const frameIntervalMs = 1000 / fps;

  options.onProgress?.(10, 'Encoding timeline tracks...');

  for (let frame = 0; frame <= totalFrames; frame++) {
    const currentTime = frame / fps;

    // 1. Draw canvas background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Subtle futuristic grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 2. Render clips active at currentTime
    const activeClips = projectData.clips.filter(
      (c) => currentTime >= c.start && currentTime <= c.start + c.duration
    );

    // Sort order: video -> overlay -> text
    const sortedClips = [...activeClips].sort((a, b) => {
      const order = { video: 1, overlay: 2, text: 3, audio: 0 };
      return (order[a.trackType] || 0) - (order[b.trackType] || 0);
    });

    for (const clip of sortedClips) {
      ctx.save();

      // Apply CSS canvas filters
      if (clip.filters) {
        const f = clip.filters;
        ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg)`;
      }

      if (clip.trackType === 'video') {
        const video = mediaElements.get(clip.id) as HTMLVideoElement | undefined;
        if (video) {
          const videoTime = (currentTime - clip.start) + clip.sourceStart;
          video.currentTime = Math.max(0, videoTime);
          ctx.drawImage(video, 0, 0, width, height);
        } else {
          // Placeholder aesthetic banner if video element is offline
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(40, 40, width - 80, height - 80);
          ctx.fillStyle = '#818cf8';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`[ ${clip.name} ]`, width / 2, height / 2);
        }
      } else if (clip.trackType === 'overlay') {
        const img = mediaElements.get(clip.id) as HTMLImageElement | undefined;
        if (img) {
          ctx.drawImage(img, (width - img.width) / 2, (height - img.height) / 2);
        }
      } else if (clip.trackType === 'text') {
        // Draw Text clip
        const style = clip.textStyle || {
          fontSize: 36,
          fontFamily: 'Plus Jakarta Sans',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold',
        };

        const fontSize = Math.round(style.fontSize * (width / 1280));
        ctx.font = `${style.fontWeight || 'bold'} ${fontSize}px ${style.fontFamily || 'sans-serif'}`;
        ctx.textAlign = style.textAlign || 'center';
        ctx.textBaseline = 'middle';

        const textX = style.textAlign === 'left' ? 100 : style.textAlign === 'right' ? width - 100 : width / 2;
        const textY = height / 2;

        if (style.backgroundColor) {
          const textMetrics = ctx.measureText(clip.textContent || '');
          const padding = 20;
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(
            textX - textMetrics.width / 2 - padding,
            textY - fontSize / 2 - padding / 2,
            textMetrics.width + padding * 2,
            fontSize + padding
          );
        }

        ctx.fillStyle = style.color || '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(clip.textContent || clip.name, textX, textY);
      }

      ctx.restore();
    }

    // Small brand watermark
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('NASIR AI FUTURE', width - 24, height - 20);
    ctx.restore();

    // Progress update
    const percent = Math.min(95, Math.round(10 + (frame / totalFrames) * 85));
    if (frame % Math.max(1, Math.floor(fps / 2)) === 0) {
      options.onProgress?.(percent, `Rendering frame ${frame} of ${totalFrames} (${Math.round((currentTime / duration) * 100)}%)...`);
      // Yield to event loop to allow MediaRecorder to process
      await new Promise((r) => setTimeout(r, 8));
    }
  }

  options.onProgress?.(98, 'Finalizing video container...');
  recorder.stop();

  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {});
  }

  const result = await renderCompletePromise;
  options.onProgress?.(100, 'Video ready for download!');
  return result;
}
