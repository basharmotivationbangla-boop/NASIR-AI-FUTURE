import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bot,
  Film,
  Image as ImageIcon,
  Video,
  Mic,
  Camera,
  FolderSync,
  FlaskConical,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, theme } = useApp();
  const isDark = theme === 'dark';

  const navItems = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      color: 'text-sky-400',
      activeColor: isDark
        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-lg shadow-sky-500/10'
        : 'bg-sky-50 border-sky-300 text-sky-800 shadow-xs',
    },
    {
      id: 'video-editor',
      label: t.navVideoEditor,
      icon: Film,
      color: 'text-indigo-400',
      activeColor: isDark
        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
        : 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-xs',
      badge: 'CapCut',
    },
    {
      id: 'ai-chat',
      label: t.navAiAssistant,
      icon: Bot,
      color: 'text-cyan-400',
      activeColor: isDark
        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
        : 'bg-cyan-50 border-cyan-300 text-cyan-800 shadow-xs',
      badge: 'Gemini 3.8',
    },
    {
      id: 'image-studio',
      label: t.navImageStudio,
      icon: ImageIcon,
      color: 'text-violet-400',
      activeColor: isDark
        ? 'bg-violet-500/15 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10'
        : 'bg-violet-50 border-violet-300 text-violet-800 shadow-xs',
    },
    {
      id: 'video-studio',
      label: t.navVideoStudio,
      icon: Video,
      color: 'text-purple-400',
      activeColor: isDark
        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10'
        : 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs',
      badge: 'Veo',
    },
    {
      id: 'audio-studio',
      label: t.navAudioStudio,
      icon: Mic,
      color: 'text-emerald-400',
      activeColor: isDark
        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
        : 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs',
    },
    {
      id: 'capture',
      label: t.navCapture,
      icon: Camera,
      color: 'text-pink-400',
      activeColor: isDark
        ? 'bg-pink-500/15 border-pink-500/50 text-pink-300 shadow-lg shadow-pink-500/10'
        : 'bg-pink-50 border-pink-300 text-pink-800 shadow-xs',
    },
    {
      id: 'files',
      label: t.navFileManager,
      icon: FolderSync,
      color: 'text-amber-400',
      activeColor: isDark
        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10'
        : 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs',
      badge: '2,000 GB',
    },
    {
      id: 'academy',
      label: t.navAcademy,
      icon: FlaskConical,
      color: 'text-teal-400',
      activeColor: isDark
        ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-500/10'
        : 'bg-teal-50 border-teal-300 text-teal-800 shadow-xs',
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      color: 'text-slate-400',
      activeColor: isDark
        ? 'bg-slate-800/60 border-slate-700 text-slate-200'
        : 'bg-slate-100 border-slate-300 text-slate-800',
    },
  ];

  return (
    <aside className={`w-16 md:w-64 shrink-0 border-r flex flex-col justify-between select-none transition-colors ${
      isDark
        ? 'bg-[#050814]/95 border-slate-800/80 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="p-2 md:p-3 space-y-1.5 overflow-y-auto">
        <div className={`hidden md:block px-3 py-2 text-[10px] font-bold uppercase tracking-wider font-mono ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Innovation Hub
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all group ${
                isActive
                  ? `${item.activeColor} font-semibold`
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'scale-110' : item.color} transition-transform`} />
              </div>
              <div className="hidden md:flex flex-1 items-center justify-between min-w-0">
                <span className="text-xs truncate tracking-wide">
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? isDark ? 'bg-sky-500/30 text-sky-200' : 'bg-sky-100 text-sky-800 font-bold'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              {isActive && (
                <ChevronRight className="hidden md:block w-3.5 h-3.5 opacity-60 ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Storage Status Banner in Sidebar */}
      <div className={`hidden md:block p-3 m-2.5 rounded-2xl border transition-colors ${
        isDark
          ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold font-mono">NASIR CLOUD</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2,000 GB
          </span>
        </div>
        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 h-full w-[4%]" />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
          <span>Target Capacity</span>
          <span>2.0 TB Target</span>
        </div>
      </div>
    </aside>
  );
};
