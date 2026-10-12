import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Film,
  Bot,
  Image as ImageIcon,
  Video,
  Mic,
  Camera,
  FolderSync,
  FlaskConical,
  Settings,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setActiveTab, language } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'video-editor',
      title: language === 'en' ? 'Open CapCut Timeline Video Editor' : 'টাইমলাইন ভিডিও এডিটর খুলুন',
      desc: language === 'en' ? 'Multi-track timeline, trim, split, canvas export' : 'মাল্টি-ট্র্যাক ভিডিও এডিটিং ও রেন্ডারিং',
      icon: Film,
      category: 'Video',
    },
    {
      id: 'ai-chat',
      title: language === 'en' ? 'AI Conversational Assistant' : 'এআই সহকারী ওপেন করুন',
      desc: language === 'en' ? 'Gemini 3.8 Flash multimodal reasoning & chat' : 'জেমিনি ৩.৮ ফ্ল্যাশ বহুমুখী এআই চ্যাট',
      icon: Bot,
      category: 'AI Assistant',
    },
    {
      id: 'image-studio',
      title: language === 'en' ? 'AI Image Studio & Graphic Design' : 'এআই ইমেজ স্টুডিও ও ডিজাইন',
      desc: language === 'en' ? 'Generate 1:1, 16:9, 9:16 images, crop, filters' : 'ছবি তৈরি ও ইন-ব্রাউজার এডিটর',
      icon: ImageIcon,
      category: 'Image',
    },
    {
      id: 'video-studio',
      title: language === 'en' ? 'AI Video Studio (Veo Engine)' : 'এআই ভিডিও স্টুডিও',
      desc: language === 'en' ? 'Text/image to video, storyboard generator' : 'ভিডিও জেনারেশন ও সিন প্ল্যানার',
      icon: Video,
      category: 'Video',
    },
    {
      id: 'audio-studio',
      title: language === 'en' ? 'Voice Recorder & Text-to-Speech' : 'ভয়েস রেকর্ডার ও টিটিএস',
      desc: language === 'en' ? 'Real mic recording, TTS synthesizer, audio transcribe' : 'মাইক্রোফোন রেকর্ডিং ও ট্রান্সক্রিপশন',
      icon: Mic,
      category: 'Audio',
    },
    {
      id: 'capture',
      title: language === 'en' ? 'Camera & Screen Recorder' : 'ক্যামেরা ও স্ক্রিন রেকর্ডার',
      desc: language === 'en' ? 'Capture photo, record camera stream or desktop' : 'লাইভ ক্যামেরা স্ন্যাপশট ও স্ক্রিন রেকর্ডিং',
      icon: Camera,
      category: 'Media',
    },
    {
      id: 'files',
      title: language === 'en' ? 'Media Library & 2,000 GB Cloud Storage' : 'মিডিয়া লাইব্রেরি ও স্টোরেজ',
      desc: language === 'en' ? 'Unified media manager, local cache, backup' : 'ফাইল ম্যানেজার ও স্টোরেজ স্ট্যাটাস',
      icon: FolderSync,
      category: 'Storage',
    },
    {
      id: 'academy',
      title: language === 'en' ? 'Science, Coding & Robotics Academy' : 'বিজ্ঞান ও উদ্ভাবন একাডেমি',
      desc: language === 'en' ? 'Interactive physics simulation, code sandbox, invention lab' : 'সিমুলেশন, কোডিং ও আবিষ্কারের ল্যাব',
      icon: FlaskConical,
      category: 'Education',
    },
    {
      id: 'settings',
      title: language === 'en' ? 'System Settings & Provider Diagnostics' : 'সিস্টেম সেটিংস ও স্ট্যাটাস',
      desc: language === 'en' ? 'API keys, bilingual language, themes, backup' : 'ভাষা, থিম ও ব্যাকআপ সেটিংস',
      icon: Settings,
      category: 'Settings',
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'en' ? 'Type a command, tool or search...' : 'টুলস বা কমান্ড খুঁজুন...'}
            className="w-full bg-transparent text-slate-100 text-sm placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {language === 'en' ? 'No matching commands or tools found.' : 'কোনো ফলাফল পাওয়া যায়নি।'}
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-sky-500/50 group-hover:bg-indigo-500/10 transition-colors">
                      <Icon className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {item.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>NASIR AI FUTURE Quick Dispatcher</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-slate-300">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
