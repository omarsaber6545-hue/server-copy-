import React, { useState } from 'react';
import { Server, ArrowLeftRight, Search, ShieldCheck, Users, Copy, Check } from 'lucide-react';
import { DiscordGuild } from '../types/discord';
import { Language, translations } from '../i18n/translations';

interface ServerSelectorProps {
  lang: Language;
  guilds: DiscordGuild[];
  sourceGuildId: string;
  setSourceGuildId: (id: string) => void;
  targetGuildId: string;
  setTargetGuildId: (id: string) => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  lang,
  guilds,
  sourceGuildId,
  setSourceGuildId,
  targetGuildId,
  setTargetGuildId
}) => {
  const t = translations[lang];
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSourceGuilds = guilds.filter(
    (g) =>
      g.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      g.id.includes(sourceSearch)
  );

  const filteredTargetGuilds = guilds.filter(
    (g) =>
      g.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
      g.id.includes(targetSearch)
  );

  const sourceGuild = guilds.find((g) => g.id === sourceGuildId);
  const targetGuild = guilds.find((g) => g.id === targetGuildId);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSwap = () => {
    const temp = sourceGuildId;
    setSourceGuildId(targetGuildId);
    setTargetGuildId(temp);
  };

  return (
    <div className="discord-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-discord-blurple/10 text-discord-blurple">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {lang === 'ar' ? 'تحديد السيرفرات' : 'Select Servers'}
            </h2>
            <p className="text-xs text-discord-muted">
              {lang === 'ar'
                ? 'اختر السيرفر الذي تريد نسخه والسيرفر الجديد المراد اللصق فيه'
                : 'Choose the source server to copy and the target destination'}
            </p>
          </div>
        </div>

        {sourceGuildId && targetGuildId && (
          <button
            onClick={handleSwap}
            title={lang === 'ar' ? 'تبديل السيرفرين' : 'Swap servers'}
            className="p-2 rounded-xl bg-discord-dark hover:bg-discord-hover text-discord-muted hover:text-white border border-discord-card transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Source Guild Card */}
        <div className="space-y-3 bg-discord-darker p-4 rounded-2xl border border-discord-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-discord-blurple flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-discord-blurple" />
              {t.sourceServer}
            </span>
            {sourceGuild && (
              <button
                onClick={() => copyToClipboard(sourceGuild.id)}
                className="text-[11px] text-discord-muted hover:text-white flex items-center gap-1 bg-discord-card px-2 py-0.5 rounded-lg"
              >
                {copiedId === sourceGuild.id ? <Check className="w-3 h-3 text-discord-green" /> : <Copy className="w-3 h-3" />}
                <span>ID: {sourceGuild.id.slice(0, 6)}...</span>
              </button>
            )}
          </div>

          {/* Search bar if guilds available */}
          {guilds.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-discord-muted" />
              <input
                type="text"
                placeholder={t.searchGuilds}
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="w-full bg-discord-dark border border-discord-card/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-discord-muted/60 focus:outline-none focus:border-discord-blurple"
              />
            </div>
          )}

          {/* Select or Manual ID */}
          {guilds.length > 0 ? (
            <select
              value={sourceGuildId}
              onChange={(e) => setSourceGuildId(e.target.value)}
              className="w-full bg-discord-dark border border-discord-card rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-discord-blurple"
            >
              <option value="">-- {t.selectSource} --</option>
              {filteredSourceGuilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.id})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={sourceGuildId}
              onChange={(e) => setSourceGuildId(e.target.value)}
              placeholder={t.enterGuildId}
              className="w-full bg-discord-dark border border-discord-card rounded-xl px-3 py-2.5 text-xs text-white placeholder-discord-muted focus:outline-none focus:border-discord-blurple font-mono"
            />
          )}

          {/* Selected Guild Preview */}
          {sourceGuild && (
            <div className="flex items-center gap-3 bg-discord-card/60 p-3 rounded-xl border border-discord-blurple/20">
              {sourceGuild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${sourceGuild.id}/${sourceGuild.icon}.png?size=64`}
                  alt={sourceGuild.name}
                  className="w-10 h-10 rounded-xl object-cover border border-discord-blurple/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-discord-blurple flex items-center justify-center text-white font-bold text-sm">
                  {sourceGuild.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{sourceGuild.name}</p>
                <div className="flex items-center gap-3 text-[11px] text-discord-muted mt-0.5">
                  <span className="font-mono">{sourceGuild.id}</span>
                  {sourceGuild.approximate_member_count !== undefined && (
                    <span className="flex items-center gap-1 text-discord-green">
                      <Users className="w-3 h-3" />
                      {sourceGuild.approximate_member_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Target Guild Card */}
        <div className="space-y-3 bg-discord-darker p-4 rounded-2xl border border-discord-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-discord-green flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-discord-green" />
              {t.targetServer}
            </span>
            {targetGuild && (
              <button
                onClick={() => copyToClipboard(targetGuild.id)}
                className="text-[11px] text-discord-muted hover:text-white flex items-center gap-1 bg-discord-card px-2 py-0.5 rounded-lg"
              >
                {copiedId === targetGuild.id ? <Check className="w-3 h-3 text-discord-green" /> : <Copy className="w-3 h-3" />}
                <span>ID: {targetGuild.id.slice(0, 6)}...</span>
              </button>
            )}
          </div>

          {/* Search bar if guilds available */}
          {guilds.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-discord-muted" />
              <input
                type="text"
                placeholder={t.searchGuilds}
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                className="w-full bg-discord-dark border border-discord-card/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-discord-muted/60 focus:outline-none focus:border-discord-green"
              />
            </div>
          )}

          {/* Select or Manual ID */}
          {guilds.length > 0 ? (
            <select
              value={targetGuildId}
              onChange={(e) => setTargetGuildId(e.target.value)}
              className="w-full bg-discord-dark border border-discord-card rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-discord-green"
            >
              <option value="">-- {t.selectTarget} --</option>
              {filteredTargetGuilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.id})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={targetGuildId}
              onChange={(e) => setTargetGuildId(e.target.value)}
              placeholder={t.enterGuildId}
              className="w-full bg-discord-dark border border-discord-card rounded-xl px-3 py-2.5 text-xs text-white placeholder-discord-muted focus:outline-none focus:border-discord-green font-mono"
            />
          )}

          {/* Selected Target Guild Preview */}
          {targetGuild && (
            <div className="flex items-center gap-3 bg-discord-card/60 p-3 rounded-xl border border-discord-green/20">
              {targetGuild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${targetGuild.id}/${targetGuild.icon}.png?size=64`}
                  alt={targetGuild.name}
                  className="w-10 h-10 rounded-xl object-cover border border-discord-green/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-discord-green/20 text-discord-green flex items-center justify-center font-bold text-sm">
                  {targetGuild.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{targetGuild.name}</p>
                <div className="flex items-center gap-3 text-[11px] text-discord-muted mt-0.5">
                  <span className="font-mono">{targetGuild.id}</span>
                  <span className="flex items-center gap-1 text-discord-green">
                    <ShieldCheck className="w-3 h-3" />
                    {lang === 'ar' ? 'هدف النسخ' : 'Destination'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
