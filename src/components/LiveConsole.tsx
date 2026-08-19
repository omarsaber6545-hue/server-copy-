import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Square,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  Check,
  Activity
} from 'lucide-react';
import { LogMessage, LogLevel, CloneProgress } from '../types/discord';
import { Language, translations } from '../i18n/translations';

interface LiveConsoleProps {
  lang: Language;
  logs: LogMessage[];
  progress: CloneProgress;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onClearLogs: () => void;
  isReady: boolean;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({
  lang,
  logs,
  progress,
  onStart,
  onPause,
  onResume,
  onCancel,
  onClearLogs,
  isReady
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'all' | LogLevel>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => filter === 'all' || log.level === filter);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-discord-green shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-discord-yellow shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-discord-red shrink-0 mt-0.5" />;
      case 'rate-limit':
        return <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />;
      default:
        return <Info className="w-3.5 h-3.5 text-discord-blurple shrink-0 mt-0.5" />;
    }
  };

  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400 font-bold';
      case 'rate-limit':
        return 'text-amber-300 bg-amber-500/10 px-1 py-0.5 rounded';
      default:
        return 'text-discord-text';
    }
  };

  return (
    <div className="discord-card p-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-discord-blurple/10 text-discord-blurple">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {t.liveConsole}
              {progress.status === 'running' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-discord-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-discord-green"></span>
                </span>
              )}
            </h2>
            <p className="text-xs text-discord-muted">
              {progress.currentStep || t.readyToClone}
            </p>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {progress.status === 'idle' || progress.status === 'completed' || progress.status === 'error' || progress.status === 'cancelled' ? (
            <button
              onClick={onStart}
              disabled={!isReady}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-discord-green hover:bg-emerald-600 disabled:bg-discord-card disabled:text-discord-muted text-discord-darker font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-discord-green/20 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startCloning}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {progress.status === 'running' ? (
                <button
                  onClick={onPause}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-discord-yellow hover:bg-yellow-500 text-discord-darker font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{t.pauseCloning}</span>
                </button>
              ) : (
                <button
                  onClick={onResume}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-discord-green hover:bg-emerald-600 text-discord-darker font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.resumeCloning}</span>
                </button>
              )}

              <button
                onClick={onCancel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-discord-red/20 hover:bg-discord-red border border-discord-red/40 hover:text-white text-discord-red font-bold py-2 px-4 rounded-xl text-xs transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.cancelCloning}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Progress Bar */}
      <div className="mb-4 bg-discord-darker p-3.5 rounded-2xl border border-discord-card/60">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-discord-muted flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-discord-blurple" />
            {t.progress}
          </span>
          <span className="text-white font-mono text-sm">{progress.percentage}%</span>
        </div>

        <div className="w-full bg-discord-card h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progress.status === 'completed'
                ? 'bg-discord-green'
                : progress.status === 'error'
                ? 'bg-discord-red'
                : 'bg-gradient-to-r from-discord-blurple to-discord-fuchsia'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Counter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
          <div className="bg-discord-card/60 p-2 rounded-lg text-center">
            <span className="text-discord-muted block">{t.statusRoles}</span>
            <span className="font-bold text-white font-mono">
              {progress.rolesCount.done} / {progress.rolesCount.total}
            </span>
          </div>
          <div className="bg-discord-card/60 p-2 rounded-lg text-center">
            <span className="text-discord-muted block">{t.statusChannels}</span>
            <span className="font-bold text-white font-mono">
              {progress.channelsCount.done} / {progress.channelsCount.total}
            </span>
          </div>
          <div className="bg-discord-card/60 p-2 rounded-lg text-center">
            <span className="text-discord-muted block">{t.statusEmojis}</span>
            <span className="font-bold text-white font-mono">
              {progress.emojisCount.done} / {progress.emojisCount.total}
            </span>
          </div>
          <div className="bg-discord-card/60 p-2 rounded-lg text-center">
            <span className="text-discord-muted block">{t.statusStickers}</span>
            <span className="font-bold text-white font-mono">
              {progress.stickersCount.done} / {progress.stickersCount.total}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 bg-discord-darker p-1 rounded-xl border border-discord-card">
          {(['all', 'success', 'warning', 'error', 'rate-limit'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filter === lvl
                  ? 'bg-discord-card text-white shadow-sm'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              {lvl === 'all'
                ? t.allLogs
                : lvl === 'success'
                ? t.successLogs
                : lvl === 'warning'
                ? t.warningLogs
                : lvl === 'error'
                ? t.errorLogs
                : t.rateLimitLogs}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-discord-darker hover:bg-discord-hover text-discord-muted hover:text-white text-xs border border-discord-card transition-all disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-discord-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : t.copyLogs}</span>
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-discord-darker hover:bg-discord-red/20 text-discord-muted hover:text-discord-red text-xs border border-discord-card transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearLogs}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Screen */}
      <div className="bg-[#0e0f11] border border-discord-card/80 rounded-xl p-3.5 h-64 overflow-y-auto font-mono text-xs text-discord-text space-y-1.5 shadow-inner">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-discord-muted/50 text-xs italic">
            {lang === 'ar'
              ? 'سجل العمليات فارغ حالياً. اضغط "بدء عملية النسخ" للبدء.'
              : 'Logs are currently empty. Click "Start Cloning" to begin.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-white/[0.02] px-1 py-0.5 rounded">
              <span className="text-discord-muted text-[10px] shrink-0 font-sans mt-0.5">
                [{log.timestamp}]
              </span>
              {getLogIcon(log.level)}
              <span className={`break-words flex-1 ${getLogColor(log.level)}`}>
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
