import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TokenManager } from './components/TokenManager';
import { ServerSelector } from './components/ServerSelector';
import { CloneOptions } from './components/CloneOptions';
import { LiveConsole } from './components/LiveConsole';
import { BackupManager } from './components/BackupManager';
import { HelpGuide } from './components/HelpGuide';
import {
  TokenType,
  DiscordUser,
  DiscordGuild,
  CloneOptionsState,
  LogMessage,
  CloneProgress,
  FullGuildData
} from './types/discord';
import { Language, translations } from './i18n/translations';
import * as api from './services/discordApi';
import { ServerClonerEngine } from './services/clonerEngine';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'cloner' | 'backup' | 'help'>('cloner');

  // Auth & Guilds State
  const [token, setToken] = useState<string>('');
  const [tokenType, setTokenType] = useState<TokenType>('bot');
  const [currentUser, setCurrentUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Selected Servers
  const [sourceGuildId, setSourceGuildId] = useState<string>('');
  const [targetGuildId, setTargetGuildId] = useState<string>('');

  // Clone Options
  const [options, setOptions] = useState<CloneOptionsState>({
    cloneServerInfo: true,
    cleanTargetServer: false,
    cloneRoles: true,
    cloneCategories: true,
    cloneChannels: true,
    clonePermissions: true,
    cloneEmojis: true,
    cloneStickers: true,
    cloneVoiceSettings: true,
    delayBetweenRequests: 1000
  });

  // Logs & Progress State
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [progress, setProgress] = useState<CloneProgress>({
    status: 'idle',
    currentStep: '',
    percentage: 0,
    totalItems: 0,
    completedItems: 0,
    rolesCount: { total: 0, done: 0 },
    categoriesCount: { total: 0, done: 0 },
    channelsCount: { total: 0, done: 0 },
    emojisCount: { total: 0, done: 0 },
    stickersCount: { total: 0, done: 0 }
  });

  // Cloner execution control refs
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  // Sync RTL / LTR on html document element
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Add a log entry helper
  const addLog = (entry: Omit<LogMessage, 'id' | 'timestamp'>) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      ...entry
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Test token & fetch user profile + guilds
  const handleTestToken = async () => {
    if (!token.trim()) return;
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      addLog({ level: 'info', text: lang === 'ar' ? 'جاري التحقق من التوكن...' : 'Testing token...' });
      const user = await api.getCurrentUser(token, tokenType);
      setCurrentUser(user);
      addLog({ level: 'success', text: `${lang === 'ar' ? 'تم تسجيل الدخول بنجاح كـ' : 'Logged in as'}: ${user.username}` });

      const fetchedGuilds = await api.getUserGuilds(token, tokenType);
      setGuilds(fetchedGuilds);
      addLog({ level: 'info', text: `${lang === 'ar' ? 'تم العثور على' : 'Found'} ${fetchedGuilds.length} ${lang === 'ar' ? 'سيرفر متاح' : 'servers'}` });
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      addLog({ level: 'error', text: `${lang === 'ar' ? 'خطأ في التوكن' : 'Token error'}: ${err.message}` });
      setCurrentUser(null);
      setGuilds([]);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Start Cloning Process
  const handleStartCloning = async (customBackupData?: FullGuildData, customTargetId?: string) => {
    const target = customTargetId || targetGuildId;
    const source = customBackupData ? customBackupData.guild.id : sourceGuildId;

    if (!token.trim()) {
      alert(t.pleaseFillToken);
      return;
    }

    if (!customBackupData && (!source || !target)) {
      alert(t.selectBothGuilds);
      return;
    }

    if (!customBackupData && source === target) {
      alert(t.sameGuildError);
      return;
    }

    isPausedRef.current = false;
    isCancelledRef.current = false;

    // Reset progress counters
    setProgress({
      status: 'running',
      currentStep: t.fetchingData,
      percentage: 2,
      totalItems: 0,
      completedItems: 0,
      rolesCount: { total: 0, done: 0 },
      categoriesCount: { total: 0, done: 0 },
      channelsCount: { total: 0, done: 0 },
      emojisCount: { total: 0, done: 0 },
      stickersCount: { total: 0, done: 0 }
    });

    const engine = new ServerClonerEngine(token, tokenType, options, {
      onLog: (log) => addLog(log),
      onProgress: (p) => setProgress((prev) => ({ ...prev, ...p })),
      shouldContinue: () => !isCancelledRef.current
    });

    await engine.clone(source, target, customBackupData);
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setProgress((prev) => ({ ...prev, status: 'paused' }));
    addLog({ level: 'warning', text: lang === 'ar' ? 'تم إيقاف النسخ مؤقتاً.' : 'Cloning paused.' });
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setProgress((prev) => ({ ...prev, status: 'running' }));
    addLog({ level: 'info', text: lang === 'ar' ? 'تم استئناف عملية النسخ.' : 'Cloning resumed.' });
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setProgress((prev) => ({ ...prev, status: 'cancelled', currentStep: 'Cancelled' }));
    addLog({ level: 'error', text: lang === 'ar' ? 'تم إلغاء عملية النسخ بواسطة المستخدم.' : 'Cloning was cancelled.' });
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Restore from Backup JSON file
  const handleStartRestoreFromData = (backupData: FullGuildData, targetId: string) => {
    setActiveTab('cloner');
    setTargetGuildId(targetId);
    handleStartCloning(backupData, targetId);
  };

  return (
    <div className="min-h-screen bg-discord-darker flex flex-col">
      {/* App Header */}
      <Header
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: Live Cloner */}
        {activeTab === 'cloner' && (
          <div className="space-y-6">
            {/* Step 1: Token & Authentication */}
            <TokenManager
              lang={lang}
              token={token}
              setToken={setToken}
              tokenType={tokenType}
              setTokenType={setTokenType}
              currentUser={currentUser}
              guildCount={guilds.length}
              isLoading={isLoadingAuth}
              onTestToken={handleTestToken}
              error={authError}
            />

            {/* Step 2: Select Servers */}
            <ServerSelector
              lang={lang}
              guilds={guilds}
              sourceGuildId={sourceGuildId}
              setSourceGuildId={setSourceGuildId}
              targetGuildId={targetGuildId}
              setTargetGuildId={setTargetGuildId}
            />

            {/* Step 3: Clone Customization Options */}
            <CloneOptions
              lang={lang}
              options={options}
              setOptions={setOptions}
            />

            {/* Step 4: Live Progress Console & Controls */}
            <LiveConsole
              lang={lang}
              logs={logs}
              progress={progress}
              onStart={() => handleStartCloning()}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onClearLogs={handleClearLogs}
              isReady={!!token.trim() && (!!sourceGuildId || !!targetGuildId)}
            />
          </div>
        )}

        {/* TAB 2: Backup & Restore */}
        {activeTab === 'backup' && (
          <BackupManager
            lang={lang}
            token={token}
            tokenType={tokenType}
            guilds={guilds}
            onStartRestoreFromData={handleStartRestoreFromData}
          />
        )}

        {/* TAB 3: Help & Guide */}
        {activeTab === 'help' && <HelpGuide lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-discord-card/50 py-4 px-6 text-center text-xs text-discord-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'ar'
              ? 'تطبيق نسخ سيرفرات ديسكورد • مفتوح المصدر على GitHub'
              : 'Discord Server Cloner • Open Source on GitHub'}
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/omarsaber6545-hue/server-copy-"
              target="_blank"
              rel="noreferrer"
              className="text-discord-blurple hover:underline"
            >
              omarsaber6545-hue/server-copy-
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
