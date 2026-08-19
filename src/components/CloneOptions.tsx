import React from 'react';
import {
  Sliders,
  ShieldAlert,
  Hash,
  Smile,
  Sticker,
  Volume2,
  FolderTree,
  UserCheck,
  Zap,
  Info,
  Clock
} from 'lucide-react';
import { CloneOptionsState } from '../types/discord';
import { Language, translations } from '../i18n/translations';

interface CloneOptionsProps {
  lang: Language;
  options: CloneOptionsState;
  setOptions: React.Dispatch<React.SetStateAction<CloneOptionsState>>;
}

export const CloneOptions: React.FC<CloneOptionsProps> = ({
  lang,
  options,
  setOptions
}) => {
  const t = translations[lang];

  const updateOption = <K extends keyof CloneOptionsState>(
    key: K,
    value: CloneOptionsState[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const optionItems = [
    {
      id: 'cloneServerInfo' as const,
      label: t.optionServerInfo,
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'cloneRoles' as const,
      label: t.optionRoles,
      icon: UserCheck,
      color: 'text-discord-blurple',
      bg: 'bg-discord-blurple/10'
    },
    {
      id: 'cloneCategories' as const,
      label: t.optionCategories,
      icon: FolderTree,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'cloneChannels' as const,
      label: t.optionChannels,
      icon: Hash,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'clonePermissions' as const,
      label: t.optionPermissions,
      icon: ShieldAlert,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'cloneEmojis' as const,
      label: t.optionEmojis,
      icon: Smile,
      color: 'text-discord-yellow',
      bg: 'bg-yellow-500/10'
    },
    {
      id: 'cloneStickers' as const,
      label: t.optionStickers,
      icon: Sticker,
      color: 'text-discord-fuchsia',
      bg: 'bg-pink-500/10'
    },
    {
      id: 'cloneVoiceSettings' as const,
      label: t.optionVoiceSettings,
      icon: Volume2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="discord-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-discord-blurple/10 text-discord-blurple">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{t.cloneOptions}</h2>
          <p className="text-xs text-discord-muted">
            {lang === 'ar'
              ? 'حدد العناصر التي تريد نقلها وسرعة النسخ'
              : 'Choose the elements to copy and request delay'}
          </p>
        </div>
      </div>

      {/* Warning Danger Zone: Clean Target Server */}
      <div className="mb-4 bg-discord-red/10 border border-discord-red/30 p-3.5 rounded-2xl">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.cleanTargetServer}
            onChange={(e) => updateOption('cleanTargetServer', e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-discord-red bg-discord-darker border-discord-red/50 focus:ring-0 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-xs font-bold text-discord-red flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-discord-red" />
              {t.optionCleanTarget}
            </span>
            <p className="text-[11px] text-discord-muted mt-0.5">
              {t.optionCleanTargetWarn}
            </p>
          </div>
        </label>
      </div>

      {/* Grid of Toggle Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {optionItems.map((item) => {
          const Icon = item.icon;
          const isChecked = options[item.id];

          return (
            <label
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-discord-darker border-discord-blurple/40 shadow-sm'
                  : 'bg-discord-darker/50 border-discord-card/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-xs font-semibold text-discord-text truncate">
                  {item.label}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => updateOption(item.id, e.target.checked)}
                className="w-4 h-4 rounded text-discord-blurple bg-discord-dark border-discord-card focus:ring-0 cursor-pointer"
              />
            </label>
          );
        })}
      </div>

      {/* Request Speed / Delay Configuration */}
      <div className="bg-discord-darker p-3.5 rounded-xl border border-discord-card/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-discord-yellow" />
            {t.delaySetting}
          </span>
          <span className="text-xs font-mono font-bold text-discord-yellow bg-discord-card px-2 py-0.5 rounded-md">
            {options.delayBetweenRequests} {t.ms}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => updateOption('delayBetweenRequests', 500)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
              options.delayBetweenRequests === 500
                ? 'bg-discord-blurple text-white border-discord-blurple'
                : 'bg-discord-dark text-discord-muted border-discord-card hover:text-white'
            }`}
          >
            {t.fast}
          </button>
          <button
            type="button"
            onClick={() => updateOption('delayBetweenRequests', 1000)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
              options.delayBetweenRequests === 1000
                ? 'bg-discord-blurple text-white border-discord-blurple'
                : 'bg-discord-dark text-discord-muted border-discord-card hover:text-white'
            }`}
          >
            {t.balanced}
          </button>
          <button
            type="button"
            onClick={() => updateOption('delayBetweenRequests', 2000)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
              options.delayBetweenRequests === 2000
                ? 'bg-discord-blurple text-white border-discord-blurple'
                : 'bg-discord-dark text-discord-muted border-discord-card hover:text-white'
            }`}
          >
            {t.safe}
          </button>
        </div>
      </div>
    </div>
  );
};
