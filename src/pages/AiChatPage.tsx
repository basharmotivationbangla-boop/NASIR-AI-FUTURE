import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Conversation, ChatMessage } from '../types';
import { getConversations, saveConversation, deleteConversation } from '../services/db';
import { sendChatMessage } from '../services/api';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Code2,
  Atom,
  Lightbulb,
  FileText,
  AlertCircle,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export const AiChatPage: React.FC = () => {
  const { language, theme, addNotification } = useApp();
  const isDark = theme === 'dark';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'general' | 'code' | 'science' | 'invention' | 'summary'>('general');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    const list = await getConversations();
    if (list.length === 0) {
      const defaultConvo: Conversation = {
        id: 'convo_' + Date.now(),
        title: language === 'en' ? 'Welcome to NASIR AI' : 'নাসির এআই-তে স্বাগতম',
        mode: 'general',
        messages: [
          {
            id: 'msg_welcome',
            role: 'assistant',
            content:
              language === 'en'
                ? 'Welcome to NASIR AI FUTURE. I am your multimodal creative and scientific intelligence assistant. How can I assist your video projects, research, or invention concepts today?'
                : 'নাসির এআই ফিউচার-এ আপনাকে স্বাগতম। আমি আপনার ক্রিয়েটিভ এবং বৈজ্ঞানিক বুদ্ধিমত্তা সম্পন্ন সহকারী। আজকে আপনার ভিডিও প্রজেক্ট, গবেষণা বা নতুন আবিষ্কারের ধারণায় কীভাবে সহায়তা করতে পারি?',
            timestamp: new Date().toISOString(),
            model: 'gemini-3.8-flash',
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      await saveConversation(defaultConvo);
      setConversations([defaultConvo]);
      setActiveConvoId(defaultConvo.id);
    } else {
      setConversations(list);
      setActiveConvoId(list[0].id);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const activeConvo = conversations.find((c) => c.id === activeConvoId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  const handleNewChat = async () => {
    const newConvo: Conversation = {
      id: 'convo_' + Date.now(),
      title: language === 'en' ? 'New Conversation' : 'নতুন আলাপ',
      mode: chatMode,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    await saveConversation(newConvo);
    setConversations((prev) => [newConvo, ...prev]);
    setActiveConvoId(newConvo.id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConvoId === id) {
      setActiveConvoId(updated[0]?.id || null);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputText).trim();
    if (!promptToSend || isGenerating || !activeConvo) return;

    setInputText('');
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...activeConvo.messages, userMsg];
    const updatedConvo: Conversation = {
      ...activeConvo,
      title: activeConvo.messages.length === 0 ? promptToSend.slice(0, 30) : activeConvo.title,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setConversations((prev) => prev.map((c) => (c.id === updatedConvo.id ? updatedConvo : c)));
    await saveConversation(updatedConvo);

    setIsGenerating(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(apiMessages, chatMode, language);

      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: res.timestamp,
        model: res.model,
      };

      const finalConvo: Conversation = {
        ...updatedConvo,
        messages: [...updatedMessages, aiMsg],
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) => prev.map((c) => (c.id === finalConvo.id ? finalConvo : c)));
      await saveConversation(finalConvo);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || 'Failed to get response from Gemini API.');
      addNotification('AI Error', err?.message || 'Could not communicate with Gemini model', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    {
      label: language === 'en' ? '🎬 Video Script Outline' : '🎬 ভিডিও স্ক্রিপ্ট রূপরেখা',
      prompt: language === 'en'
        ? 'Create a 60-second high-energy video script for a futuristic AI gadget reveal with visual camera scene notes.'
        : 'একটি ৬০ সেকেন্ডের ভবিষ্যৎ প্রজন্মের এআই গ্যাজেট উন্মোচনের ভিডিও স্ক্রিপ্ট তৈরি করো, যেখানে ক্যামেরার শট বিবরণ থাকবে।',
    },
    {
      label: language === 'en' ? '⚡ Robotics Sensor Loop' : '⚡ রোবোটিক্স সেন্সর কোড',
      prompt: language === 'en'
        ? 'Write an Arduino / ESP32 C++ code snippet for an obstacle avoidance rover using an HC-SR04 ultrasonic sensor and dual DC motors.'
        : 'একটি অবস্টাকল অ্যাভয়েডেন্স রোভারের জন্য HC-SR04 আল্ট্রাসনিক সেন্সর এবং ডিসি মোটর নিয়ন্ত্রণ করার জন্য আরডুইনো সি++ কোড লিখে দাও।',
    },
    {
      label: language === 'en' ? '🌌 Quantum Entanglement' : '🌌 কোয়ান্টাম এনট্যাঙ্গলমেন্ট',
      prompt: language === 'en'
        ? 'Explain quantum entanglement and Bell inequalities in clear, step-by-step principles for high-school physics students.'
        : 'কোয়ান্টাম এনট্যাঙ্গলমেন্ট কী এবং এটি কীভাবে কাজ করে তা সহজ ভাষায় পয়েন্ট আকারে ব্যাখ্যা করো।',
    },
  ];

  return (
    <div className={`flex h-[calc(100vh-4rem)] overflow-hidden transition-colors ${
      isDark ? 'bg-[#050814] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. Conversations Sidebar */}
      <div className={`w-64 md:w-72 border-r flex flex-col justify-between shrink-0 transition-colors ${
        isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'
      }`}>
        <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'en' ? 'New Conversation' : 'নতুন আলাপ'}</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => {
            const isActive = c.id === activeConvoId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConvoId(c.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 font-semibold'
                      : 'bg-sky-50 border border-sky-300 text-sky-800 font-semibold'
                    : isDark
                    ? 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Engine status footer */}
        <div className={`p-3 border-t text-[11px] flex items-center justify-between font-mono ${
          isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}>
          <span>Engine: Gemini 3.8 Flash</span>
          <span className="text-emerald-500 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        </div>
      </div>

      {/* 2. Chat Main Area */}
      <div className={`flex-1 flex flex-col justify-between overflow-hidden ${
        isDark ? 'bg-[#050814]' : 'bg-slate-50'
      }`}>
        {/* Chat Mode Header */}
        <div className={`h-12 border-b px-4 flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {activeConvo?.title || 'NASIR AI Future Assistant'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            {(
              [
                { id: 'general', label: 'General', icon: Sparkles },
                { id: 'code', label: 'Coding', icon: Code2 },
                { id: 'science', label: 'Science', icon: Atom },
                { id: 'invention', label: 'Invention', icon: Lightbulb },
                { id: 'summary', label: 'Research', icon: FileText },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setChatMode(m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    chatMode === m.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeConvo && activeConvo.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 py-12">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-sky-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                {language === 'en' ? 'What will we create today?' : 'আজকে আমরা কী তৈরি করব?'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'Ask me for video editing ideas, storyboard scripts, Python or JavaScript coding help, science physics formulas, or invention patent roadmaps in English or বাংলা.'
                  : 'ভিডিও আইডিয়া, স্টোরিবোর্ড, কোডিং, পদার্থবিজ্ঞান বা নতুন আবিষ্কারের পরিকল্পনা জানতে যেকোনো প্রশ্ন করুন।'}
              </p>

              {/* Suggestions */}
              <div className="grid grid-cols-1 gap-2 w-full pt-4">
                {promptSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.prompt)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-left text-xs transition-colors group flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-300 group-hover:text-sky-300">
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-200 truncate ml-3">
                      {s.prompt.slice(0, 50)}...
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConvo?.messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isUser
                        ? 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white'
                        : 'bg-slate-800 border border-slate-700 text-cyan-400'
                    }`}
                  >
                    {isUser ? 'U' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-2xl group relative ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{m.model || 'gemini-3.8-flash'}</span>
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isGenerating && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-sky-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking & generating response with Gemini 3.8 Flash...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Provider Error</div>
                <div className="text-[11px] text-rose-200 mt-0.5">{errorMessage}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Ensure GEMINI_API_KEY is active in your project settings.
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={`p-3 sm:p-4 border-t transition-colors ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`flex items-center gap-2 border rounded-2xl px-3 py-2 transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-800 focus-within:border-indigo-500/70 text-slate-100'
                : 'bg-slate-100 border-slate-300 focus-within:border-indigo-500 text-slate-900 shadow-inner'
            }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Ask anything in English or বাংলা (code, scripts, physics, robotics)...'
                  : 'বাংলা বা ইংরেজিতে প্রশ্ন করুন (কোড, স্ক্রিপ্ট, বিজ্ঞান)...'
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="p-2 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-white shadow-md disabled:opacity-40 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
