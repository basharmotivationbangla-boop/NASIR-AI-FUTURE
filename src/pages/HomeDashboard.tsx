import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { getProjects, deleteProject, saveProject } from '../services/db';
import {
  Sparkles,
  Film,
  Bot,
  Image as ImageIcon,
  Video,
  Mic,
  Camera,
  FolderSync,
  Plus,
  Play,
  Trash2,
  Copy,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  BookOpen,
  Atom,
  ArrowRight,
  Radio,
  Sliders,
  CheckCircle2,
  Database,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Phone,
  LogIn,
} from 'lucide-react';

// Hero & Showcase Imagery generated via generate_image
import heroLaboratoryImg from '../assets/images/hero_quantum_future_1791815696996.jpg';
import studioCanvasImg from '../assets/images/studio_creative_canvas_1791815712768.jpg';
import roboticsCoreImg from '../assets/images/science_robotics_core_1791815727690.jpg';

export const HomeDashboard: React.FC = () => {
  const {
    t,
    language,
    theme,
    setActiveTab,
    setActiveProject,
    addNotification,
    storageUsage,
    projectCount,
    mediaCount,
    user,
    isLoggedIn,
    openAuthModal,
    syncVault,
    restoreVault,
    isSyncing,
    lastSyncTime,
  } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const isDark = theme === 'dark';

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await getProjects();
      setProjects(list);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateNewProject = async (type: 'video' | 'image' | 'audio' = 'video') => {
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: `${language === 'en' ? 'New Creative Project' : 'নতুন ক্রিয়েটিভ প্রজেক্ট'} #${projects.length + 1}`,
      type,
      aspectRatio: '16:9',
      duration: 10,
      width: 1920,
      height: 1080,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
        duration: 10,
        tracks: [
          { id: 'v1', name: 'Main Video', type: 'video' },
          { id: 't1', name: 'Titles & Text', type: 'text' },
          { id: 'a1', name: 'Audio Track', type: 'audio' },
        ],
        clips: [],
      },
    };

    await saveProject(newProj);
    setActiveProject(newProj);
    addNotification('Project Created', `Created ${newProj.name}`, 'success');
    setActiveTab('video-editor');
  };

  const handleOpenProject = (proj: Project) => {
    setActiveProject(proj);
    if (proj.type === 'video') {
      setActiveTab('video-editor');
    } else if (proj.type === 'image') {
      setActiveTab('image-studio');
    } else {
      setActiveTab('video-editor');
    }
  };

  const handleDuplicateProject = async (proj: Project) => {
    const dup: Project = {
      ...proj,
      id: 'proj_' + Date.now(),
      name: `${proj.name} (${language === 'en' ? 'Copy' : 'কপি'})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProject(dup);
    addNotification('Project Duplicated', `Created copy of ${proj.name}`, 'info');
    loadProjects();
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete.id);
    addNotification('Project Removed', `Deleted ${projectToDelete.name}`, 'info');
    setProjectToDelete(null);
    loadProjects();
  };

  // 8 Dedicated Studio Cards matching user prompt
  const studioCards = [
    {
      id: 'ai-chat',
      title: t.cardAiChatTitle,
      desc: t.cardAiChatDesc,
      icon: Bot,
      accent: 'from-cyan-500 to-blue-600',
      badge: 'Gemini 3.8 Flash',
      glow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      action: () => setActiveTab('ai-chat'),
      actionLabel: language === 'en' ? 'Open AI Chat' : 'এআই চ্যাট খুলুন',
    },
    {
      id: 'image-studio',
      title: t.cardImageStudioTitle,
      desc: t.cardImageStudioDesc,
      icon: ImageIcon,
      accent: 'from-violet-500 to-indigo-600',
      badge: '1:1 / 16:9 / 9:16',
      glow: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
      action: () => setActiveTab('image-studio'),
      actionLabel: language === 'en' ? 'Launch Image Studio' : 'ইমেজ স্টুডিও খুলুন',
    },
    {
      id: 'video-studio',
      title: t.cardVideoStudioTitle,
      desc: t.cardVideoStudioDesc,
      icon: Video,
      accent: 'from-purple-500 to-fuchsia-600',
      badge: 'Veo Engine',
      glow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      action: () => setActiveTab('video-studio'),
      actionLabel: language === 'en' ? 'Launch Video Studio' : 'ভিডিও স্টুডিও খুলুন',
    },
    {
      id: 'video-editor',
      title: t.cardVideoEditorTitle,
      desc: t.cardVideoEditorDesc,
      icon: Film,
      accent: 'from-indigo-500 to-sky-600',
      badge: 'Multi-Track Timeline',
      glow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      action: () => handleCreateNewProject('video'),
      actionLabel: language === 'en' ? 'Open Video Editor' : 'ভিডিও এডিটর খুলুন',
      imagePreview: studioCanvasImg,
    },
    {
      id: 'audio-studio',
      title: t.cardVoiceStudioTitle,
      desc: t.cardVoiceStudioDesc,
      icon: Mic,
      accent: 'from-emerald-500 to-teal-600',
      badge: 'TTS & Transcribe',
      glow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      action: () => setActiveTab('audio-studio'),
      actionLabel: language === 'en' ? 'Open Voice Studio' : 'ভয়েস স্টুডিও খুলুন',
    },
    {
      id: 'science-lab',
      title: t.cardScienceLabTitle,
      desc: t.cardScienceLabDesc,
      icon: Atom,
      accent: 'from-teal-500 to-cyan-600',
      badge: '60 FPS Physics',
      glow: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
      action: () => setActiveTab('academy'),
      actionLabel: language === 'en' ? 'Launch Science Lab' : 'বিজ্ঞান ল্যাব খুলুন',
    },
    {
      id: 'robotics-lab',
      title: t.cardRoboticsLabTitle,
      desc: t.cardRoboticsLabDesc,
      icon: Cpu,
      accent: 'from-sky-500 to-indigo-600',
      badge: 'Hardware & Circuits',
      glow: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
      action: () => setActiveTab('academy'),
      actionLabel: language === 'en' ? 'Launch Robotics Lab' : 'রোবোটিক্স ল্যাব খুলুন',
      imagePreview: roboticsCoreImg,
    },
    {
      id: 'my-projects',
      title: t.cardMyProjectsTitle,
      desc: t.cardMyProjectsDesc,
      icon: Layers,
      accent: 'from-amber-500 to-orange-600',
      badge: `${projectCount} Active Projects`,
      glow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      action: () => setActiveTab('files'),
      actionLabel: language === 'en' ? 'View All Projects' : 'সকল প্রজেক্ট দেখুন',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in">
      {/* 1. Premium Futuristic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 shadow-2xl transition-all">
        {/* Background Visual Asset with Scrim Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroLaboratoryImg}
            alt="Futuristic AI Laboratory"
            className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050814] via-[#050814]/85 to-[#050814]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold tracking-wide backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="font-mono">NEXT-GEN AI INNOVATION ECOSYSTEM</span>
          </div>

          {/* Title & Official Slogan */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              <span className="bg-gradient-to-r from-sky-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                NASIR AI FUTURE
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-sky-200/90 tracking-wide">
              {t.brandSlogan}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
            {language === 'en'
              ? 'A unified, professional-grade platform bridging timeline video editing, multimodal Gemini intelligence, generative 8K imagery, voiceover studios, and robotic invention laboratories.'
              : 'একটি সমন্বিত, ভবিষ্যৎ প্রযুক্তির প্ল্যাটফর্ম—যেখানে পাবেন ক্যাপকাট ভিডিও এডিটিং, জেমিনি বহুমুখী বুদ্ধিমত্তা, ছবি তৈরি, ভয়েস স্টুডিও ও রোবোটিক্স ল্যাব।'}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleCreateNewProject('video')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:from-sky-300 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.startCreating}</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-chat')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-slate-200 font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>{t.exploreTools}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Permanent Database Vault Protection Banner (Never Lose Files) */}
      <section className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/40 border-emerald-500/30 shadow-emerald-950/20'
          : 'bg-gradient-to-r from-emerald-50 via-white to-sky-50 border-emerald-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'en'
                    ? 'Permanent Database Vault — Zero Data Loss Guaranteed'
                    : 'স্থায়ী সার্ভার ডাটাবেস ভল্ট — জীবনেও কোনো ফাইল হারাবে না'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  {isLoggedIn ? 'CONNECTED & SECURED' : 'LIFETIME BACKUP'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isLoggedIn && user?.phone ? (
                  <>
                    <span className="font-semibold text-emerald-400">
                      {language === 'en' ? 'User Mobile: ' : 'ব্যবহারকারীর মোবাইল: '}
                      {user.phone}
                    </span>
                    {' • '}
                    {language === 'en'
                      ? 'All video timeline edits, generated AI images, voice recordings, and inventions are continuously saved to your permanent server vault.'
                      : 'আপনার সকল ভিডিও এডিট, এআই ছবি, ভয়েস রেকর্ডিং ও আবিষ্কার স্বয়ংক্রিয়ভাবে পার্মানেন্ট সার্ভার ডাটাবেসে সেভ হচ্ছে। যেকোনো কম্পিউটার বা ফোনে লগইন করলে সব ফাইল ফিরে পাবেন।'}
                  </>
                ) : (
                  <>
                    {language === 'en'
                      ? 'Create an account with your mobile number and password to lock in lifetime permanent database protection. Secret Name recovery ensures you can always regain access.'
                      : 'মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সাইন আপ করুন। সাইন আপের সময় সিক্রেট নাম সেট করে রাখুন যাতে পাসওয়ার্ড ভুলে গেলেও সহজে রিকভারি করতে পারেন এবং ফাইল আজীবনের জন্য সুরক্ষিত থাকে।'}
                  </>
                )}
              </p>
              {lastSyncTime && (
                <div className="text-[11px] font-mono text-emerald-400/90 pt-0.5">
                  {language === 'en' ? 'Last Vault Sync: ' : 'সর্বশেষ ডাটাবেস সিঙ্ক: '}
                  {lastSyncTime}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => syncVault()}
                  disabled={isSyncing}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? (language === 'en' ? 'Saving to DB...' : 'ডাটাবেসে সেভ হচ্ছে...') : (language === 'en' ? 'Sync to Permanent DB' : 'ডাটাবেসে সেভ করুন')}</span>
                </button>
                <button
                  onClick={() => restoreVault()}
                  disabled={isSyncing}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'en' ? 'Restore All Files' : 'ফাইল পুনরুদ্ধার করুন'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'en' ? 'Sign Up for Lifetime DB' : 'সাইন আপ করুন ও ডাটাবেস যুক্ত করুন'}</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
      </section>

      {/* 2. Platform Telemetry & Overview Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between opacity-80 mb-1.5 text-xs font-semibold">
            <span>{t.recentProjects}</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white dark:text-white text-slate-900">
            {projectCount}
          </div>
          <div className="text-[11px] opacity-70 mt-0.5">Active timeline projects</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between opacity-80 mb-1.5 text-xs font-semibold">
            <span>{t.totalFiles}</span>
            <FolderSync className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white dark:text-white text-slate-900">
            {mediaCount}
          </div>
          <div className="text-[11px] opacity-70 mt-0.5">Media & video assets</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between opacity-80 mb-1.5 text-xs font-semibold">
            <span>{t.cloudStorageTarget}</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            2,000 GB
          </div>
          <div className="text-[11px] opacity-70 mt-0.5">2.0 TB Cloud sync target</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between opacity-80 mb-1.5 text-xs font-semibold">
            <span>AI Brain Engine</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            Gemini 3.8
          </div>
          <div className="text-[11px] opacity-70 mt-0.5">Multimodal Flash active</div>
        </div>
      </section>

      {/* 3. The 8 Dedicated Studio Cards (Core Requirement) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white dark:text-white text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>{language === 'en' ? 'Creative & Innovation Studios' : 'সৃজনশীল ও উদ্ভাবনী স্টুডিওসমূহ'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a specialized studio to begin creating digital projects
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            8 Integrated Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {studioCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`group rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xl ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                } ${card.glow}`}
              >
                {/* Optional Top Visual Banner for Hero Studios */}
                {card.imagePreview ? (
                  <div className="w-full h-32 overflow-hidden relative border-b border-slate-800/80">
                    <img
                      src={card.imagePreview}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-black/60 text-sky-300 backdrop-blur-sm border border-white/10 font-bold">
                      {card.badge}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.accent} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-4 space-y-2 flex-1">
                  <h3 className={`text-base font-bold leading-tight group-hover:text-sky-400 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                {/* Card Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={card.action}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isDark
                        ? 'bg-slate-800/90 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700/60'
                        : 'bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. My Recent Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-white dark:text-white text-slate-900">
              {t.recentProjects}
            </h2>
          </div>
          <button
            onClick={() => handleCreateNewProject('video')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.createNewProject}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            Loading recent workspace projects...
          </div>
        ) : projects.length === 0 ? (
          <div className={`p-8 rounded-3xl border border-dashed text-center space-y-3 ${
            isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-300'
          }`}>
            <Film className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-400">{t.noProjectsYet}</div>
            <button
              onClick={() => handleCreateNewProject('video')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {t.createNewProject}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`group p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 shadow-lg ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/40'
                    : 'bg-white border-slate-200 hover:border-indigo-400'
                }`}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold truncate group-hover:text-sky-400 transition-colors ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {proj.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="uppercase font-mono font-bold text-indigo-400">
                        {proj.type}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {proj.aspectRatio || '16:9'}
                  </span>
                </div>

                {/* Project Visual Thumbnail */}
                <div
                  onClick={() => handleOpenProject(proj)}
                  className="w-full h-32 rounded-2xl bg-black border border-slate-800/80 flex items-center justify-center cursor-pointer relative overflow-hidden group/thumb"
                >
                  <img
                    src={studioCanvasImg}
                    alt={proj.name}
                    className="w-full h-full object-cover filter brightness-75 group-hover/thumb:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500 text-white text-xs font-bold shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {language === 'en' ? 'Edit in CapCut' : 'এডিটরে খুলুন'}
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenProject(proj)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>{language === 'en' ? 'Open in Editor' : 'প্রজেক্ট খুলুন'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateProject(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                {language === 'en' ? 'Delete Project?' : 'প্রজেক্ট মুছে ফেলবেন?'}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'en'
                ? `Are you sure you want to permanently delete "${projectToDelete.name}"? This action cannot be undone.`
                : `আপনি কি নিশ্চিত যে "${projectToDelete.name}" স্থায়ীভাবে মুছে ফেলতে চান?`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                {language === 'en' ? 'Delete Permanently' : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
