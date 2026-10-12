export type Language = 'en' | 'bn';
export type Theme = 'dark' | 'light' | 'system';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  secretName?: string;
  avatarUrl?: string;
  plan: string;
  createdAt: string;
  isLoggedIn?: boolean;
}

export interface Project {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document' | 'invention';
  updatedAt: string;
  createdAt: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  data?: any; // Specific editor state
}

export type TrackType = 'video' | 'audio' | 'text' | 'overlay';

export interface TimelineClip {
  id: string;
  trackId: string;
  trackType: TrackType;
  name: string;
  mediaId?: string;
  mediaUrl?: string;
  start: number; // in seconds
  duration: number; // in seconds
  sourceStart: number; // offset in media
  volume?: number; // 0 to 1
  isMuted?: boolean;
  // Visual properties
  filters?: {
    brightness: number; // 0 to 200, default 100
    contrast: number; // 0 to 200, default 100
    saturation: number; // 0 to 200, default 100
    blur: number; // 0 to 20, default 0
    grayscale: number; // 0 to 100, default 0
    sepia: number; // 0 to 100, default 0
    hueRotate: number; // 0 to 360, default 0
  };
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  // Text specific
  textContent?: string;
  textStyle?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: string;
  };
}

export interface VideoTrack {
  id: string;
  name: string;
  type: TrackType;
  isMuted?: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
}

export interface VideoProjectData {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  width: number;
  height: number;
  duration: number; // total composition duration
  tracks: VideoTrack[];
  clips: TimelineClip[];
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  url: string;
  size: number;
  blob?: Blob;
  createdAt: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: 'general' | 'creative' | 'code' | 'science' | 'invention' | 'summary';
  messages: ChatMessage[];
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'video' | 'image' | 'coding' | 'writing' | 'science' | 'invention';
  prompt: string;
  tags: string[];
}

export interface InventionIdea {
  id: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  materials: string[];
  steps: string[];
  testLogs: string;
  status: 'ideation' | 'planning' | 'prototyping' | 'tested' | 'patented';
  updatedAt: string;
}

export interface NoteDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
