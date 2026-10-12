import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  X,
  Phone,
  Lock,
  KeyRound,
  User,
  ShieldCheck,
  Database,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    signup,
    resetPasswordWithSecretName,
    language,
    theme,
  } = useApp();

  const isDark = theme === 'dark';

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [secretName, setSecretName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter your phone number' : 'মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!password) {
      setErrorMessage(language === 'en' ? 'Please enter your password' : 'পাসওয়ার্ড প্রদান করুন');
      return;
    }

    try {
      setLoading(true);
      const success = await login(phone.trim(), password);
      if (!success) {
        setErrorMessage(
          language === 'en'
            ? 'Invalid phone number or password.'
            : 'ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone.trim()) {
      setErrorMessage(language === 'en' ? 'Phone number is required' : 'মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (password.length < 4) {
      setErrorMessage(
        language === 'en'
          ? 'Password must be at least 4 characters'
          : 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে'
      );
      return;
    }
    if (!secretName.trim()) {
      setErrorMessage(
        language === 'en'
          ? 'Secret Name is required (used for password recovery)'
          : 'সিক্রেট নাম প্রদান করুন (পাসওয়ার্ড ভুলে গেলে পুনরুদ্ধারের জন্য প্রয়োজন)'
      );
      return;
    }

    try {
      setLoading(true);
      const success = await signup(
        phone.trim(),
        password,
        secretName.trim(),
        fullName.trim() || 'Nasir Creator'
      );
      if (success) {
        setSuccessMessage(
          language === 'en'
            ? 'Account created and permanent database linked!'
            : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং স্থায়ী ডাটাবেস যুক্ত হয়েছে!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone.trim()) {
      setErrorMessage(language === 'en' ? 'Phone number is required' : 'মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!secretName.trim()) {
      setErrorMessage(
        language === 'en'
          ? 'Secret name is required'
          : 'সাইন আপের সময় ব্যবহৃত সিক্রেট নাম দিন'
      );
      return;
    }
    if (password.length < 4) {
      setErrorMessage(
        language === 'en'
          ? 'New password must be at least 4 characters'
          : 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে'
      );
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage(
        language === 'en'
          ? 'Passwords do not match'
          : 'উভয় পাসওয়ার্ড মিলছে না'
      );
      return;
    }

    try {
      setLoading(true);
      const success = await resetPasswordWithSecretName(
        phone.trim(),
        secretName.trim(),
        password
      );
      if (success) {
        setSuccessMessage(
          language === 'en'
            ? 'Password reset successfully! Now log in with your new password.'
            : 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
        );
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0b1022] border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="md" showText={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            NASIR AI FUTURE
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>
              {language === 'en'
                ? 'Permanent Database Vault Protection'
                : 'স্থায়ী ডাটাবেস ভল্ট ও ক্লাউড ব্যাকআপ'}
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`grid grid-cols-3 p-1 rounded-2xl border mb-6 text-xs font-bold ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-1 rounded-xl transition-all text-center ${
              authModalTab === 'login'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'en' ? 'Log In' : 'লগইন'}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-1 rounded-xl transition-all text-center ${
              authModalTab === 'signup'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'en' ? 'Sign Up' : 'সাইন আপ'}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalTab('forgot');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-1 rounded-xl transition-all text-center truncate ${
              authModalTab === 'forgot'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'en' ? 'Recovery' : 'রিকভারি'}
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'en' ? 'Mobile Phone Number' : 'মোবাইল নম্বর'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. 01712345678' : 'যেমন: 01712345678'}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  {language === 'en' ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Permanent Database Assurance Box */}
            <div className={`p-3 rounded-2xl border text-[11px] flex items-center gap-2.5 ${
              isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'en'
                  ? 'Logging in automatically restores your files from the permanent database vault.'
                  : 'লগইন করলে আপনার পূর্বের সংরক্ষিত সকল ফাইল ও প্রজেক্ট ডাটাবেস থেকে স্বয়ংক্রিয়ভাবে ফিরে আসবে।'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{language === 'en' ? 'Verifying & Syncing...' : 'যাচাই ও সিঙ্ক হচ্ছে...'}</span>
              ) : (
                <>
                  <span>{language === 'en' ? 'Log In to Studio' : 'স্টুডিওতে লগইন করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-2">
              {language === 'en' ? "Don't have an account yet?" : 'এখনও কোনো অ্যাকাউন্ট নেই?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2"
              >
                {language === 'en' ? 'Create Account' : 'নতুন একাউন্ট খুলুন'}
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP TAB */}
        {authModalTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'Full Name' : 'পূর্ণ নাম'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Nasir Hossain' : 'যেমন: নাসির হোসেন'}
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'Mobile Phone Number' : 'মোবাইল নম্বর'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'en' ? '01712345678' : 'যেমন: 01712345678'}
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Secret Name Field - Central to User Request */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'en' ? 'Secret Name (Security Key)' : 'সিক্রেট নাম (পাসওয়ার্ড রিকভারি)'}</span>
                </label>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {language === 'en' ? 'Required' : 'অবশ্যই মনে রাখুন'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={secretName}
                  onChange={(e) => setSecretName(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Favorite Pet, Nickname, or Secret Code'
                      : 'যেমন: প্রিয় ডাকনাম, মায়ের প্রিয় নাম বা গোপন শব্দ'
                  }
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-amber-500/40 focus:border-amber-400 text-white'
                      : 'bg-amber-50/40 border-amber-300 focus:border-amber-500 text-slate-900'
                  }`}
                  required
                />
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1 leading-tight flex items-start gap-1">
                <HelpCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? 'If you ever forget your password, you will use this Secret Name to recover your account.'
                    : 'পাসওয়ার্ড ভুলে গেলে এই সিক্রেট নাম ব্যবহার করে পাসওয়ার্ড রিসেট করা যাবে। তাই এটি মনে রাখুন।'}
                </span>
              </p>
            </div>

            {/* Guaranteed Never-Lose-Files Database Shield */}
            <div className={`p-3 rounded-2xl border text-[11px] space-y-1 ${
              isDark ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-sky-400">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === 'en'
                    ? 'Permanent Database Guarantee'
                    : 'স্থায়ী ডাটাবেস নিরাপত্তা নিশ্চয়তা'}
                </span>
              </div>
              <p className="opacity-90 leading-tight">
                {language === 'en'
                  ? 'Your files and projects will be permanently linked to this account database so they will never be lost.'
                  : 'আপনার একাউন্টের সাথে পার্মানেন্ট ডাটাবেস যুক্ত থাকবে যাতে জীবনেও কোনো সময় কোনো ফাইল বা প্রজেক্ট না হারিয়ে যায়।'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{language === 'en' ? 'Creating Account & Vault...' : 'অ্যাকাউন্ট ও ডাটাবেস তৈরি হচ্ছে...'}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'en' ? 'Sign Up & Activate Database' : 'সাইন আপ করুন ও ডাটাবেস যুক্ত করুন'}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              {language === 'en' ? 'Already have an account?' : 'ইতিমধ্যে একাউন্ট আছে?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2"
              >
                {language === 'en' ? 'Log In' : 'লগইন করুন'}
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD TAB (RECOVERY WITH SECRET NAME) */}
        {authModalTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-3.5">
            <div className={`p-3 rounded-2xl border text-xs ${
              isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="font-bold flex items-center gap-1 text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span>{language === 'en' ? 'Secret Name Password Recovery' : 'সিক্রেট নাম দিয়ে পাসওয়ার্ড রিকভারি'}</span>
              </div>
              <p className="mt-1 text-[11px] opacity-90 leading-tight">
                {language === 'en'
                  ? 'Enter the mobile number and secret name you set during sign up to unlock and change your password.'
                  : 'সাইন আপ করার সময় আপনি যে মোবাইল নম্বর ও সিক্রেট নাম দিয়েছিলেন, তা দিয়ে নতুন পাসওয়ার্ড সেট করুন।'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'Mobile Phone Number' : 'মোবাইল নম্বর'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'en' ? '01712345678' : 'যেমন: 01712345678'}
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                {language === 'en' ? 'Secret Name (Given during sign up)' : 'আপনার সিক্রেট নাম (যা সাইন আপে দিয়েছিলেন)'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={secretName}
                  onChange={(e) => setSecretName(e.target.value)}
                  placeholder={language === 'en' ? 'Your secret name' : 'আপনার সিক্রেট নাম লিখুন'}
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-amber-500/50 focus:border-amber-400 text-white'
                      : 'bg-amber-50/50 border-amber-300 focus:border-amber-500 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'en' ? 'Confirm New Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 focus:border-sky-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{language === 'en' ? 'Verifying Secret Name...' : 'সিক্রেট নাম যাচাই হচ্ছে...'}</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{language === 'en' ? 'Reset Password Now' : 'পাসওয়ার্ড পরিবর্তন ও সেভ করুন'}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2"
              >
                {language === 'en' ? 'Back to Login' : 'লগইনে ফিরে যান'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
