import React from 'react';
import { Shield, Globe, Sparkles, Smartphone, Code2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: 'cloner' | 'backup' | 'help';
  setActiveTab: (tab: 'cloner' | 'backup' | 'help') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  activeTab,
  setActiveTab,
}) => {
  const t = translations[lang];

  return (
    <header className="discord-glass sticky top-0 z-50 border-b border-discord-card px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-discord-blurple shadow-lg shadow-discord-blurple/30 animate-pulse-glow">
              <Shield className="w-6 h-6 text-white" />
              <Sparkles className="w-3.5 h-3.5 text-discord-yellow absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
                  {t.appTitle}
                </h1>
                <span className="bg-discord-blurple/20 text-discord-blurple text-xs font-semibold px-2 py-0.5 rounded-full border border-discord-blurple/30">
                  v1.0 APK
                </span>
              </div>
              <p className="text-xs text-discord-muted hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Mobile APK and GitHub links */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-discord-dark hover:bg-discord-card border border-discord-card text-xs font-medium text-discord-text transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-discord-blurple" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-discord-darker p-1 rounded-2xl border border-discord-card/50 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('cloner')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'cloner'
                ? 'bg-discord-blurple text-white shadow-md shadow-discord-blurple/25'
                : 'text-discord-muted hover:text-white hover:bg-discord-card/50'
            }`}
          >
            {lang === 'ar' ? 'الناسخ المباشر' : 'Live Cloner'}
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'backup'
                ? 'bg-discord-blurple text-white shadow-md shadow-discord-blurple/25'
                : 'text-discord-muted hover:text-white hover:bg-discord-card/50'
            }`}
          >
            {t.backupTab}
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'help'
                ? 'bg-discord-blurple text-white shadow-md shadow-discord-blurple/25'
                : 'text-discord-muted hover:text-white hover:bg-discord-card/50'
            }`}
          >
            {t.helpTab}
          </button>
        </div>

        {/* Action Buttons: Language & GitHub */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-discord-dark hover:bg-discord-card border border-discord-card/80 text-sm font-medium text-discord-text transition-all hover:border-discord-blurple/50 shadow-sm"
          >
            <Globe className="w-4 h-4 text-discord-blurple" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <a
            href="https://github.com/omarsaber6545-hue/server-copy-"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-discord-dark hover:bg-discord-card border border-discord-card/80 text-sm font-medium text-discord-text transition-all hover:text-white shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
