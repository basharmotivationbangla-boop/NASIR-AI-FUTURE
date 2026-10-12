import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Theme, UserProfile, Project, AppNotification } from '../types';
import { translations } from '../i18n/translations';
import {
  getProjects,
  getMediaItems,
  getStorageUsage,
  getAllWorkspaceDataForSync,
  mergeVaultDataIntoDB,
} from '../services/db';
import {
  signupUser,
  loginUser,
  resetPasswordWithSecret,
  syncVaultToServer,
  restoreVaultFromServer,
} from '../services/api';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: UserProfile | null;
  isLoggedIn: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  dismissNotification: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  storageUsage: { usedBytes: number; quotaBytes: number; percent: number };
  refreshStats: () => Promise<void>;
  projectCount: number;
  mediaCount: number;

  // Auth & Permanent Database Vault
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'signup' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot') => void;
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (phone: string, password: string, secretName: string, name?: string) => Promise<boolean>;
  logout: () => void;
  resetPasswordWithSecretName: (phone: string, secretName: string, newPassword: string) => Promise<boolean>;
  syncVault: () => Promise<boolean>;
  restoreVault: () => Promise<boolean>;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('nasir_lang') as Language) || 'bn';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('nasir_theme') as Theme) || 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, quotaBytes: 1024 * 1024 * 1024, percent: 0 });

  // Auth & Database Vault State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('nasir_vault_last_sync');
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nasir_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default initial user for instant seamless experience
    return {
      id: 'user_master_1',
      name: 'Nasir Creator',
      phone: '01700000000',
      email: 'creator@nasiraifuture.local',
      plan: 'Pro Studio Creator',
      createdAt: new Date().toISOString(),
      isLoggedIn: true,
    };
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nasir_lang', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('nasir_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const id = 'notif_' + Math.random().toString(36).substring(2, 9);
    const newNotif: AppNotification = { id, title, message, type, timestamp: new Date().toISOString() };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const refreshStats = async () => {
    try {
      const [projects, media, usage] = await Promise.all([
        getProjects(),
        getMediaItems(),
        getStorageUsage(),
      ]);
      setProjectCount(projects.length);
      setMediaCount(media.length);
      setStorageUsage(usage);
    } catch (err) {
      console.warn('Error refreshing stats:', err);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  // Global keyboard shortcuts (Ctrl+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // 1. Sync all local files & projects to server database vault
  const syncVault = async (): Promise<boolean> => {
    if (!user?.phone) {
      addNotification(
        language === 'en' ? 'Sign In Required' : 'লগইন প্রয়োজন',
        language === 'en' ? 'Please sign in to sync with your permanent database vault.' : 'ডাটাবেস ভল্টে ফাইল স্থায়ীভাবে ব্যাকআপ রাখতে লগইন করুন।',
        'warning'
      );
      openAuthModal('login');
      return false;
    }

    try {
      setIsSyncing(true);
      const workspace = await getAllWorkspaceDataForSync();
      const res = await syncVaultToServer({
        phone: user.phone,
        projects: workspace.projects,
        media: workspace.media,
        inventions: workspace.inventions,
      });

      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);
      localStorage.setItem('nasir_vault_last_sync', now);

      addNotification(
        language === 'en' ? 'Database Vault Secured' : 'ডাটাবেস ভল্ট সুরক্ষিত',
        language === 'en' ? 'All files, projects, and media permanently synchronized.' : 'সকল প্রজেক্ট ও ফাইল স্থায়ী ডাটাবেসে সফলভাবে ব্যাকআপ রাখা হয়েছে।',
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Vault sync error:', err);
      addNotification(
        language === 'en' ? 'Sync Failed' : 'সিঙ্ক ব্যর্থ হয়েছে',
        err?.message || 'Could not sync files to permanent database.',
        'error'
      );
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Restore all files from server database vault
  const restoreVault = async (): Promise<boolean> => {
    if (!user?.phone) {
      addNotification(
        language === 'en' ? 'Sign In Required' : 'লগইন প্রয়োজন',
        language === 'en' ? 'Please sign in to restore files from your database vault.' : 'ডাটাবেস থেকে ফাইল ফিরিয়ে আনতে লগইন করুন।',
        'warning'
      );
      openAuthModal('login');
      return false;
    }

    try {
      setIsSyncing(true);
      const data = await restoreVaultFromServer(user.phone);
      const result = await mergeVaultDataIntoDB({
        projects: data.projects,
        media: data.media,
        inventions: data.inventions,
      });

      await refreshStats();

      addNotification(
        language === 'en' ? 'Database Restored' : 'ডাটাবেস পুনরুদ্ধার সম্পন্ন',
        language === 'en'
          ? `Restored ${result.projectsMerged} projects, ${result.mediaMerged} media files, and ${result.inventionsMerged} inventions.`
          : `${result.projectsMerged}টি প্রজেক্ট, ${result.mediaMerged}টি মিডিয়া এবং ${result.inventionsMerged}টি আবিষ্কার ডাটাবেস থেকে সফলভাবে পুনরুদ্ধার হয়েছে।`,
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Vault restore error:', err);
      addNotification(
        language === 'en' ? 'Restore Failed' : 'পুনরুদ্ধার ব্যর্থ হয়েছে',
        err?.message || 'Could not restore files from server database.',
        'error'
      );
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. User Login
  const login = async (phone: string, pass: string): Promise<boolean> => {
    try {
      const res = await loginUser({ phone, password: pass });
      const loggedUser: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        phone: res.user.phone,
        plan: res.user.plan || 'Pro Studio Creator',
        createdAt: res.user.createdAt,
        isLoggedIn: true,
      };

      setUser(loggedUser);
      localStorage.setItem('nasir_user', JSON.stringify(loggedUser));
      setIsAuthModalOpen(false);

      addNotification(
        language === 'en' ? 'Welcome Back!' : 'স্বাগতম!',
        language === 'en'
          ? `Logged in as ${loggedUser.name}. Permanent database active.`
          : `${loggedUser.name}, আপনি সফলভাবে লগইন করেছেন। স্থায়ী ডাটাবেস ভল্ট সক্রিয়।`,
        'success'
      );

      // Immediately restore and merge any saved files from server vault
      await restoreVault();

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      addNotification(
        language === 'en' ? 'Login Failed' : 'লগইন ব্যর্থ',
        err?.message || 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।',
        'error'
      );
      return false;
    }
  };

  // 4. User Sign Up with Phone, Password & Secret Name
  const signup = async (
    phone: string,
    pass: string,
    secretName: string,
    name?: string
  ): Promise<boolean> => {
    try {
      const res = await signupUser({ phone, password: pass, secretName, name });
      const newUser: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        phone: res.user.phone,
        secretName: res.user.secretName,
        plan: res.user.plan || 'Pro Studio Creator',
        createdAt: res.user.createdAt,
        isLoggedIn: true,
      };

      setUser(newUser);
      localStorage.setItem('nasir_user', JSON.stringify(newUser));
      setIsAuthModalOpen(false);

      addNotification(
        language === 'en' ? 'Account Created' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে',
        language === 'en'
          ? 'Permanent database vault connected. Your files will never be lost!'
          : 'স্থায়ী ডাটাবেস ভল্ট যুক্ত হয়েছে। জীবনেও আপনার ফাইল আর হারাবে না!',
        'success'
      );

      // Immediately perform initial sync of local files to new vault
      await syncVault();

      return true;
    } catch (err: any) {
      console.error('Signup error:', err);
      addNotification(
        language === 'en' ? 'Sign Up Failed' : 'সাইন আপ ব্যর্থ',
        err?.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।',
        'error'
      );
      return false;
    }
  };

  // 5. Password Reset using Secret Name
  const resetPasswordWithSecretName = async (
    phone: string,
    secretName: string,
    newPass: string
  ): Promise<boolean> => {
    try {
      const res = await resetPasswordWithSecret({
        phone,
        secretName,
        newPassword: newPass,
      });

      addNotification(
        language === 'en' ? 'Password Reset Successful' : 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে',
        language === 'en'
          ? 'You can now log in with your new password.'
          : res.message || 'নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
        'success'
      );

      setAuthModalTab('login');
      return true;
    } catch (err: any) {
      console.error('Reset password error:', err);
      addNotification(
        language === 'en' ? 'Reset Failed' : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ',
        err?.message || 'সিক্রেট নাম মেলেনি অথবা মোবাইল নম্বর ভুল।',
        'error'
      );
      return false;
    }
  };

  // 6. User Logout
  const logout = () => {
    localStorage.removeItem('nasir_user');
    setUser(null);
    addNotification(
      language === 'en' ? 'Logged Out' : 'লগআউট সম্পন্ন',
      language === 'en' ? 'You have logged out safely.' : 'আপনি সফলভাবে লগআউট করেছেন।',
      'info'
    );
  };

  const t = translations[language] || translations.en;
  const isLoggedIn = Boolean(user && user.isLoggedIn);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        user,
        isLoggedIn,
        activeTab,
        setActiveTab,
        activeProject,
        setActiveProject,
        notifications,
        addNotification,
        dismissNotification,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        storageUsage,
        refreshStats,
        projectCount,
        mediaCount,

        // Auth & Vault
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        login,
        signup,
        logout,
        resetPasswordWithSecretName,
        syncVault,
        restoreVault,
        isSyncing,
        lastSyncTime,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
