import { Project, MediaItem, Conversation, InventionIdea, NoteDocument } from '../types';

const DB_NAME = 'nasir_ai_future_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('inventions')) {
        db.createObjectStore('inventions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// Generic transaction helpers
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function getFromStore<T>(storeName: string, id: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Projects API
export async function getProjects(): Promise<Project[]> {
  const projects = await getAllFromStore<Project>('projects');
  if (projects.length === 0) {
    // Seed initial default projects
    const defaultProject: Project = {
      id: 'proj_demo_video',
      name: 'Cyberpunk Teaser - 2026',
      type: 'video',
      aspectRatio: '16:9',
      width: 1920,
      height: 1080,
      duration: 10,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
        duration: 10,
        tracks: [
          { id: 'track_v1', name: 'Video Layer 1', type: 'video' },
          { id: 'track_t1', name: 'Text & Titles', type: 'text' },
          { id: 'track_a1', name: 'Audio Track', type: 'audio' },
        ],
        clips: [
          {
            id: 'clip_intro_txt',
            trackId: 'track_t1',
            trackType: 'text',
            name: 'NASIR AI INTRO',
            start: 0.5,
            duration: 4,
            sourceStart: 0,
            textContent: 'NASIR AI FUTURE',
            textStyle: {
              fontSize: 48,
              fontFamily: 'Plus Jakarta Sans',
              color: '#38bdf8',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              textAlign: 'center',
              fontWeight: 'bold',
            },
            filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 },
          },
          {
            id: 'clip_sub_txt',
            trackId: 'track_t1',
            trackType: 'text',
            name: 'Sub-headline',
            start: 3,
            duration: 4.5,
            sourceStart: 0,
            textContent: 'Next-Gen Creative Studio',
            textStyle: {
              fontSize: 28,
              fontFamily: 'Plus Jakarta Sans',
              color: '#c084fc',
              backgroundColor: 'rgba(0,0,0,0.5)',
              textAlign: 'center',
              fontWeight: 'normal',
            },
            filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 },
          },
        ],
      },
    };
    await putToStore('projects', defaultProject);
    return [defaultProject];
  }
  return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getProject(id: string): Promise<Project | null> {
  return getFromStore<Project>('projects', id);
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = new Date().toISOString();
  await putToStore('projects', project);
}

export async function deleteProject(id: string): Promise<void> {
  await deleteFromStore('projects', id);
}

// Media API
export async function getMediaItems(): Promise<MediaItem[]> {
  const items = await getAllFromStore<MediaItem>('media');
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveMediaItem(item: MediaItem): Promise<void> {
  await putToStore('media', item);
}

export async function deleteMediaItem(id: string): Promise<void> {
  await deleteFromStore('media', id);
}

// Conversations API
export async function getConversations(): Promise<Conversation[]> {
  const convos = await getAllFromStore<Conversation>('conversations');
  return convos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function saveConversation(convo: Conversation): Promise<void> {
  convo.updatedAt = new Date().toISOString();
  await putToStore('conversations', convo);
}

export async function deleteConversation(id: string): Promise<void> {
  await deleteFromStore('conversations', id);
}

// Inventions API
export async function getInventions(): Promise<InventionIdea[]> {
  const items = await getAllFromStore<InventionIdea>('inventions');
  if (items.length === 0) {
    const defaultInvention: InventionIdea = {
      id: 'inv_1',
      title: 'Autonomous Solar Drone for Precision Agriculture',
      category: 'Robotics & CleanTech',
      problem: 'High cost and fuel consumption of manual drone monitoring for crop stress and irrigation leaks.',
      solution: 'Solar-assisted quadcopter with AI edge computing for real-time multispectral NDVI foliage health analysis.',
      materials: ['Carbon fiber frame', 'Monocrystalline solar film', 'Brushless DC motors (2212 920KV)', 'Jetson Nano / Coral TPU', 'Multispectral sensor'],
      steps: [
        'Aerodynamic drag modeling for lightweight solar wing surfaces',
        'PWM power distribution board design with MPPT solar charge controller',
        'Lightweight vision model deployment for offline crop anomaly detection',
        'Field flight testing with automated fail-safe return-to-home protocol',
      ],
      testLogs: 'Tested wind resistance up to 25 km/h. Flight duration increased from 24 mins to 48 mins under sunny noon conditions.',
      status: 'prototyping',
      updatedAt: new Date().toISOString(),
    };
    await putToStore('inventions', defaultInvention);
    return [defaultInvention];
  }
  return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function saveInvention(item: InventionIdea): Promise<void> {
  item.updatedAt = new Date().toISOString();
  await putToStore('inventions', item);
}

export async function deleteInvention(id: string): Promise<void> {
  await deleteFromStore('inventions', id);
}

// Storage estimate helper
export async function getStorageUsage(): Promise<{ usedBytes: number; quotaBytes: number; percent: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || 1024 * 1024 * 1024;
      return {
        usedBytes,
        quotaBytes,
        percent: quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0,
      };
    } catch {
      // Fallback
    }
  }
  return { usedBytes: 15 * 1024 * 1024, quotaBytes: 1024 * 1024 * 1024, percent: 1.5 };
}

// Vault Persistence Helpers (Never Lose Files)
export async function getAllWorkspaceDataForSync(): Promise<{
  projects: Project[];
  media: MediaItem[];
  inventions: InventionIdea[];
}> {
  const [projects, media, inventions] = await Promise.all([
    getAllFromStore<Project>('projects'),
    getAllFromStore<MediaItem>('media'),
    getAllFromStore<InventionIdea>('inventions'),
  ]);
  return { projects, media, inventions };
}

export async function mergeVaultDataIntoDB(data: {
  projects?: Project[];
  media?: MediaItem[];
  inventions?: InventionIdea[];
}): Promise<{ projectsMerged: number; mediaMerged: number; inventionsMerged: number }> {
  let projectsMerged = 0;
  let mediaMerged = 0;
  let inventionsMerged = 0;

  if (data.projects && Array.isArray(data.projects)) {
    for (const proj of data.projects) {
      if (proj && proj.id) {
        await putToStore('projects', proj);
        projectsMerged++;
      }
    }
  }

  if (data.media && Array.isArray(data.media)) {
    for (const item of data.media) {
      if (item && item.id) {
        await putToStore('media', item);
        mediaMerged++;
      }
    }
  }

  if (data.inventions && Array.isArray(data.inventions)) {
    for (const inv of data.inventions) {
      if (inv && inv.id) {
        await putToStore('inventions', inv);
        inventionsMerged++;
      }
    }
  }

  return { projectsMerged, mediaMerged, inventionsMerged };
}
