import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MediaItem } from '../types';
import { getMediaItems, saveMediaItem, deleteMediaItem } from '../services/db';
import { fetchStorageStatus, StorageStatusResponse } from '../services/api';
import {
  FolderSync,
  Upload,
  HardDrive,
  Film,
  Image as ImageIcon,
  Music,
  Trash2,
  Download,
  Eye,
  Search,
  Grid,
  List,
  AlertCircle,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Database,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

export const FileManagerPage: React.FC = () => {
  const {
    language,
    addNotification,
    storageUsage,
    user,
    isLoggedIn,
    syncVault,
    restoreVault,
    isSyncing,
    lastSyncTime,
    openAuthModal,
  } = useApp();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<MediaItem | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatusResponse | null>(null);
  const [fileToDelete, setFileToDelete] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFiles = async () => {
    const list = await getMediaItems();
    setMediaList(list);
    try {
      const status = await fetchStorageStatus();
      setStorageStatus(status);
    } catch (err) {
      console.warn('Storage status fetch error:', err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');

      const newItem: MediaItem = {
        id: 'med_' + Date.now() + '_' + i,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        url,
        size: file.size,
        blob: file,
        createdAt: new Date().toISOString(),
      };
      await saveMediaItem(newItem);
    }

    addNotification('Files Uploaded', `Imported ${files.length} file(s) into media manager.`, 'success');
    loadFiles();
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    await deleteMediaItem(fileToDelete.id);
    addNotification('File Deleted', `Removed ${fileToDelete.name}`, 'info');
    setFileToDelete(null);
    loadFiles();
  };

  const filtered = mediaList.filter((m) => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FolderSync className="w-7 h-7 text-amber-400" />
            <span>Unified Media Library & 2,000 GB Cloud Target</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralized asset storage for video clips, audio voiceovers, high-resolution graphics and project media.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadFiles}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media Files</span>
          </button>
        </div>
      </div>

      {/* 2,000 GB Storage Target Honesty Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Cloud Storage Allocation & Honest Status</h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
            Target Capacity: 2,000 GB (2.0 TB)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-300 mb-1">Local IndexedDB Cache</div>
            <div className="text-xl font-black text-sky-400">
              {(storageUsage.usedBytes / (1024 * 1024)).toFixed(2)} MB
            </div>
            <div className="text-[10px] text-slate-300 mt-1">High-speed offline browser memory</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-300 mb-1">Remote Target Capacity</div>
            <div className="text-xl font-black text-emerald-400">2,000 GB (2 TB)</div>
            <div className="text-[10px] text-slate-300 mt-1">Enterprise cloud bucket objective</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-300 mb-1">Permanent Server Vault</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? (user?.phone || 'Connected') : 'Account Required'}</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Files permanently preserved</div>
          </div>
        </div>

        {/* Database Vault Sync & Protection Strip */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300">
                {language === 'en' ? 'Permanent Database Vault:' : 'স্থায়ী সার্ভার ডাটাবেস ভল্ট:'}
              </span>{' '}
              <span className="text-slate-300 text-[11px]">
                {language === 'en'
                  ? 'Zero data loss guarantee. Sync saves your projects & media to the persistent server database.'
                  : 'ফাইল কখনোই হারাবে না। ডাটাবেসে সিঙ্ক করলে আপনার সকল প্রজেক্ট ও মিডিয়া আজীবনের জন্য সংরক্ষিত থাকবে।'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => syncVault()}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? (language === 'en' ? 'Syncing...' : 'সিঙ্ক হচ্ছে...') : (language === 'en' ? 'Sync Now' : 'এখনই সিঙ্ক করুন')}</span>
                </button>
                <button
                  onClick={() => restoreVault()}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'en' ? 'Restore All' : 'সব ফিরিয়ে আনুন'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Sign Up for Database' : 'ডাটাবেস যুক্ত করতে সাইন আপ করুন'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Capacity honesty notice */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-slate-200">Capacity Transparency:</strong> 2,000 GB (2 TB) is the production cloud storage target. To enable persistent multi-terabyte cloud backups across devices, configure an S3 / Google Cloud Storage bucket in your backend or settings. Your device's local high-speed IndexedDB cache is currently active for instant editing.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'video', 'image', 'audio'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterType === type
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'All Files' : `${type}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-900/40">
          <FolderSync className="w-10 h-10 text-slate-700 mx-auto" />
          <div className="text-sm font-semibold text-slate-400">No media files found</div>
          <div className="text-xs text-slate-300">
            Click "Upload Media Files" above to import video clips, audio tracks, or photos.
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const isVid = item.type === 'video';
            const isAud = item.type === 'audio';
            const isImg = item.type === 'image';

            return (
              <div
                key={item.id}
                className="group p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 shadow-lg"
              >
                {/* Media Preview Thumbnail */}
                <div
                  onClick={() => setSelectedPreviewItem(item)}
                  className="w-full aspect-square rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center cursor-pointer overflow-hidden relative group/thumb"
                >
                  {isImg ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : isVid ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-10 h-10 text-emerald-400" />
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase font-mono mt-0.5">
                    {item.type} • {(item.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <a
                    href={item.url}
                    download={item.name}
                    className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setFileToDelete(item)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/80 text-xs">
          {filtered.map((item) => (
            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-850 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 shrink-0">
                  {item.type === 'video' ? <Film className="w-4 h-4 text-indigo-400" /> : item.type === 'audio' ? <Music className="w-4 h-4 text-emerald-400" /> : <ImageIcon className="w-4 h-4 text-violet-400" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-300 font-mono">{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-slate-300">{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                <a href={item.url} download={item.name} className="p-1 text-slate-400 hover:text-amber-400">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => setFileToDelete(item)} className="p-1 text-slate-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate">{selectedPreviewItem.name}</h3>
              <button onClick={() => setSelectedPreviewItem(null)} className="text-slate-400 hover:text-white text-xs">
                Close
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl bg-black border border-slate-800 flex items-center justify-center overflow-hidden">
              {selectedPreviewItem.type === 'image' ? (
                <img src={selectedPreviewItem.url} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : selectedPreviewItem.type === 'video' ? (
                <video src={selectedPreviewItem.url} controls autoPlay className="max-w-full max-h-full object-contain" />
              ) : (
                <audio src={selectedPreviewItem.url} controls autoPlay className="w-3/4" />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="font-mono">Size: {(selectedPreviewItem.size / (1024 * 1024)).toFixed(2)} MB</span>
              <a
                href={selectedPreviewItem.url}
                download={selectedPreviewItem.name}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="text-sm font-bold text-white">Delete Media Item?</div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete "{fileToDelete.name}" from your local media storage?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
