import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { NotificationToast } from './components/common/NotificationToast';
import { AuthModal } from './components/common/AuthModal';

// Pages
import { HomeDashboard } from './pages/HomeDashboard';
import { VideoEditorPage } from './pages/VideoEditorPage';
import { AiChatPage } from './pages/AiChatPage';
import { ImageStudioPage } from './pages/ImageStudioPage';
import { VideoStudioPage } from './pages/VideoStudioPage';
import { AudioStudioPage } from './pages/AudioStudioPage';
import { MediaCapturePage } from './pages/MediaCapturePage';
import { FileManagerPage } from './pages/FileManagerPage';
import { ScienceAndInventionPage } from './pages/ScienceAndInventionPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, theme } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomeDashboard />;
      case 'video-editor':
        return <VideoEditorPage />;
      case 'ai-chat':
        return <AiChatPage />;
      case 'image-studio':
        return <ImageStudioPage />;
      case 'video-studio':
        return <VideoStudioPage />;
      case 'audio-studio':
        return <AudioStudioPage />;
      case 'capture':
        return <MediaCapturePage />;
      case 'files':
        return <FileManagerPage />;
      case 'academy':
        return <ScienceAndInventionPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomeDashboard />;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      isDark ? 'bg-[#050814] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Page Viewport */}
        <main className={`flex-1 overflow-y-auto relative ${
          isDark ? 'bg-slate-950/60' : 'bg-slate-50/80'
        }`}>
          {renderActivePage()}
        </main>
      </div>

      {/* Global Command Palette, Notifications & Authentication */}
      <CommandPalette />
      <NotificationToast />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
