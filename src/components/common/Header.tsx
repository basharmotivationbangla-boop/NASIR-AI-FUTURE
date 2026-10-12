import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  Search,
  Globe,
  Sun,
  Moon,
  Plus,
  Video,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Camera,
  HardDrive,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  Sparkles,
  Settings,
  ShieldCheck,
  User,
  Database,
  LogIn,
  LogOut,
  RefreshCw,
  Phone,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    setActiveTab,
    setIsCommandPaletteOpen,
    notifications,
    dismissNotification,
    user,
    isLoggedIn,
    openAuthModal,
    syncVault,
    isSyncing,
    lastSyncTime,
    logout,
    t,
  } = useApp();

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full h-16 border-b transition-colors backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between ${
      isDark
        ? 'border-slate-800/80 bg-[#050814]/90 text-slate-100'
        : 'border-slate-200 bg-white/90 text-slate-900 shadow-xs'
    }`}>
      {/* Brand & Logo + Slogan */}
      <div className="flex items-center gap-6 min-w-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="hover:opacity-95 transition-opacity text-left focus:outline-none flex items-center gap-3 shrink-0"
        >
          <Logo size="md" />
        </button>

        {/* Global Search Bar (Trigger) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border text-sm transition-all shadow-xs group ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 hover:border-sky-500/50 text-slate-400 hover:text-slate-200'
              : 'bg-slate-100 border-slate-200 hover:border-sky-500/50 text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs">
            {language === 'en' ? 'Search studios, projects, inventions...' : 'স্টুডিও, প্রজেক্ট, আবিষ্কার খুঁজুন...'}
          </span>
          <kbd className={`ml-4 px-1.5 py-0.5 rounded border text-[10px] font-mono ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'
          }`}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Actions Cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickMenu(!showQuickMenu);
              setShowNotificationMenu(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:from-sky-300 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Create' : 'তৈরি'}
            </span>
          </button>

          {showQuickMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)} />
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
              }`}>
                <div className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {language === 'en' ? 'Creative Launchers' : 'কুইক লঞ্চার'}
                </div>
                <button
                  onClick={() => { setActiveTab('video-editor'); setShowQuickMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                    isDark ? 'text-slate-200 hover:bg-indigo-600/20 hover:text-sky-300' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>{t.cardVideoEditorTitle}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('ai-chat'); setShowQuickMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                    isDark ? 'text-slate-200 hover:bg-indigo-600/20 hover:text-sky-300' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>{t.cardAiChatTitle}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('image-studio'); setShowQuickMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                    isDark ? 'text-slate-200 hover:bg-indigo-600/20 hover:text-sky-300' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                  <span>{t.cardImageStudioTitle}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('audio-studio'); setShowQuickMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                    isDark ? 'text-slate-200 hover:bg-indigo-600/20 hover:text-sky-300' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>{t.cardVoiceStudioTitle}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('capture'); setShowQuickMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                    isDark ? 'text-slate-200 hover:bg-indigo-600/20 hover:text-sky-300' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Camera className="w-4 h-4 text-pink-400" />
                  <span>{language === 'en' ? 'Camera & Screen Studio' : 'ক্যামেরা স্টুডিও'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Permanent Database Vault Protection Button */}
        <button
          onClick={() => syncVault()}
          disabled={isSyncing}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800'
          }`}
          title={
            language === 'en'
              ? 'Permanent Database Vault: Click to sync & protect all files'
              : 'স্থায়ী ডাটাবেস ভল্ট: ফাইল স্থায়ীভাবে সুরক্ষিত রাখতে ক্লিক করুন'
          }
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-[11px]">
            {language === 'en' ? 'Permanent DB' : 'ডাটাবেস ভল্ট'}
          </span>
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
          )}
        </button>

        {/* 2,000 GB Storage Target Pill */}
        <button
          onClick={() => setActiveTab('files')}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
          title="2,000 GB Cloud Storage Target"
        >
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-[11px]">2,000 GB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowQuickMenu(false);
              setShowProfileMenu(false);
            }}
            className={`p-2 rounded-xl border transition-colors relative ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl border p-3 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    {language === 'en' ? 'System Activity' : 'নোটিফিকেশন'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                    {notifications.length} active
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    {language === 'en' ? 'All systems nominal. No new alerts.' : 'কোনো নতুন সতর্কতা নেই।'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-xl text-xs flex items-start justify-between gap-2 border ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sky-400">{n.title}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">{n.message}</div>
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="opacity-60 hover:opacity-100 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Working Language Switcher (EN ↔ বাংলা) */}
        <button
          onClick={toggleLanguage}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
          }`}
          title="Switch Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Working Theme Switcher (Dark ↔ Light) */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Login & Profile Area */}
        {isLoggedIn && user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowQuickMenu(false);
                setShowNotificationMenu(false);
              }}
              className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-900 border-transparent hover:border-slate-800'
                  : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/30 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <div className={`text-xs font-semibold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Database className="w-2.5 h-2.5 text-emerald-400" /> {user.phone || 'DB Connected'}
                </div>
              </div>
              <ChevronDown className="hidden xl:block w-3 h-3 opacity-60" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border p-2.5 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
                  isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
                }`}>
                  <div className="p-2 border-b border-slate-800/80 mb-2">
                    <div className="font-bold text-xs">{user.name}</div>
                    {user.phone && (
                      <div className="text-[11px] text-sky-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-sky-400" /> {user.phone}
                      </div>
                    )}
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      <Database className="w-3 h-3" /> {language === 'en' ? 'Permanent DB Vault' : 'ডাটাবেস ভল্ট সুরক্ষিত'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      syncVault();
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                      isDark ? 'hover:bg-slate-800 text-emerald-300' : 'hover:bg-slate-100 text-emerald-700'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{language === 'en' ? 'Sync Vault (Save Files)' : 'ডাটাবেসে ব্যাকআপ সিঙ্ক'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.settingsTitle}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('files');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                    <span>2,000 GB Storage Target</span>
                  </button>

                  <div className="my-1 border-t border-slate-800/60" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left text-rose-400 ${
                      isDark ? 'hover:bg-rose-950/30' : 'hover:bg-rose-50'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>{language === 'en' ? 'Log Out' : 'লগআউট'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'en' ? 'Log In' : 'লগইন'}</span>
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign Up' : 'সাইন আপ'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
