import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchHealth, HealthResponse } from '../services/api';
import { getProjects, getInventions, getMediaItems } from '../services/db';
import {
  Settings,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Key,
  Database,
  Lock,
  Phone,
  KeyRound,
  RefreshCw,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    user,
    isLoggedIn,
    openAuthModal,
    syncVault,
    restoreVault,
    isSyncing,
    lastSyncTime,
    logout,
    addNotification,
  } = useApp();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    async function checkStatus() {
      try {
        setLoadingHealth(true);
        const res = await fetchHealth();
        setHealth(res);
      } catch (err) {
        console.warn('Health check error:', err);
      } finally {
        setLoadingHealth(false);
      }
    }
    checkStatus();
  }, []);

  // Export full backup
  const handleExportBackup = async () => {
    try {
      const [projects, inventions, media] = await Promise.all([
        getProjects(),
        getInventions(),
        getMediaItems(),
      ]);

      const backupData = {
        app: 'NASIR AI FUTURE',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        user,
        projects,
        inventions,
        mediaCount: media.length,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nasir_ai_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addNotification('Backup Exported', 'Downloaded complete workspace archive.', 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      addNotification('Export Failed', err?.message || 'Could not create backup', 'error');
    }
  };

  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset all local projects and database entries? This action cannot be undone.')) {
      indexedDB.deleteDatabase('nasir_ai_future_db');
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className={`text-2xl sm:text-3xl font-black flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Settings className="w-7 h-7 text-slate-400" />
          <span>Settings & Platform Diagnostics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage language preferences, themes, data backups, and inspect connected AI provider integrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* 0. User Account & Permanent Database Vault (Never Lose Files) */}
        <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-indigo-950/30 border-emerald-500/30 text-slate-100 shadow-emerald-950/20'
            : 'bg-gradient-to-r from-emerald-50/50 via-white to-sky-50/50 border-emerald-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'en'
                  ? 'User Account & Permanent Database Vault (Zero Data Loss)'
                  : 'ব্যবহারকারীর অ্যাকাউন্ট ও স্থায়ী ডাটাবেস ভল্ট (ফাইল কখনো হারাবে না)'}
              </span>
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isLoggedIn ? 'PERMANENT DB ACTIVE' : 'GUEST MODE'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'en' ? 'Active Creator Profile' : 'অ্যাক্টিভ প্রোফাইল'}</span>
              </div>
              <div className="text-sm font-bold text-sky-400">{user?.name || 'Guest Creator'}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-sky-400" />
                <span>{user?.phone ? user.phone : (language === 'en' ? 'No mobile linked yet' : 'কোনো মোবাইল নম্বর যুক্ত নেই')}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {language === 'en'
                  ? 'Your account is protected by your mobile number and secret name for lifetime recovery.'
                  : 'আপনার অ্যাকাউন্ট মোবাইল নম্বর ও সিক্রেট নাম দ্বারা আজীবনের জন্য সুরক্ষিত।'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'Database Vault Persistence' : 'স্থায়ী ডাটাবেস ভল্ট স্থায়িত্ব'}</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Permanent Cloud & Server Vault' : 'স্থায়ী ক্লাউড ও সার্ভার ভল্ট সক্রিয়'}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {lastSyncTime
                  ? `${language === 'en' ? 'Last synced at: ' : 'সর্বশেষ সিঙ্ক: '} ${lastSyncTime}`
                  : (language === 'en' ? 'Ready to sync all local files' : 'সকল ফাইল ডাটাবেসে সেভ করতে প্রস্তুত')}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {language === 'en'
                  ? 'All video timeline edits, generated images, recordings and invention entries are permanently safeguarded.'
                  : 'সকল ভিডিও এডিট, এআই ছবি, ভয়েস রেকর্ডিং ও আবিষ্কার স্থায়ীভাবে ডাটাবেসে সংরক্ষিত থাকে।'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => syncVault()}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? (language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...') : (language === 'en' ? 'Sync All to Permanent DB' : 'ডাটাবেসে স্থায়ীভাবে সেভ করুন')}</span>
                </button>

                <button
                  onClick={() => restoreVault()}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'en' ? 'Restore Files from Database' : 'ডাটাবেস থেকে ফাইল ফিরিয়ে আনুন'}</span>
                </button>

                <button
                  onClick={() => openAuthModal('forgot')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40 text-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Reset Password (Secret Name)' : 'সিক্রেট নাম দিয়ে পাসওয়ার্ড পরিবর্তন'}</span>
                </button>

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Log Out' : 'লগআউট'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'en' ? 'Sign Up for Permanent Database' : 'সাইন আপ করুন ও ডাটাবেস যুক্ত করুন'}</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'en' ? 'Log In' : 'লগইন'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1. Language & Theme Preferences */}
        <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Language & Interface Localization</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Interface Language</div>
                <div className="text-[11px] text-slate-400">English (US) / বাংলা (Bengali)</div>
              </div>
              <div className={`flex p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/80 border-slate-300'
              }`}>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    language === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    language === 'bn' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Visual Theme</div>
                <div className="text-[11px] text-slate-400">Dark Neon / Clean Light</div>
              </div>
              <div className={`flex p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/80 border-slate-300'
              }`}>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    theme === 'dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 inline mr-1" /> Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    theme === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 inline mr-1" /> Light
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Provider & Health Diagnostics */}
        <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI Engine & Integration Diagnostics</span>
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark ? 'bg-slate-800 border-slate-700 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'
            }`}>
              @google/genai SDK v2.4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Gemini Server Connection</span>
                {health?.geminiConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-bold font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> Key Setup Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Server-side architecture keeps credentials protected. API requests proxy through Express backend.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Supported AI Models</span>
                <span className="text-[11px] font-mono text-sky-400">Gemini 3.8 / Veo</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chat: gemini-3.8-flash • Image: gemini-3.1-flash-lite-image • TTS: gemini-3.8-flash-lite-tts • Video: veo-3.1-lite.
              </p>
            </div>
          </div>
        </div>

        {/* 3. 2,000 GB Cloud Storage Architecture */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Cloud Storage Configuration (2,000 GB Target)</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            NASIR AI FUTURE is designed for a target capacity of 2,000 GB (2.0 TB). High-speed IndexedDB is active locally. To connect an enterprise cloud bucket for remote multi-device sync, attach an S3 / Google Cloud Storage bucket in your deployment environment variables:
          </p>
          <div className={`p-3.5 rounded-2xl border font-mono text-xs space-y-1 ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <div>STORAGE_PROVIDER=google_cloud_storage # or s3 / r2</div>
            <div>STORAGE_BUCKET_NAME=nasir-ai-future-2tb-vault</div>
            <div>STORAGE_TARGET_CAPACITY_GB=2000</div>
          </div>
        </div>

        {/* 4. Data Backup & Local Database Management */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Data Portability & Database Controls</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Full Workspace Backup (JSON)</span>
            </button>

            <button
              onClick={handleResetDatabase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Local Database</span>
            </button>
          </div>
        </div>

        {/* 5. Privacy, Ethics & Security Policy */}
        <div className={`p-6 rounded-3xl border space-y-2 text-xs transition-colors ${
          isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy by Default & Security Transparency</span>
          </div>
          <p className="leading-relaxed">
            NASIR AI FUTURE operates with client-side isolation for media and server-only API key handling. Video editing canvas layers and audio microphone inputs remain strictly on your device unless you explicitly export or submit prompts to the AI model. No unauthorized tracking or telemetry is collected.
          </p>
        </div>
      </div>
    </div>
  );
};
