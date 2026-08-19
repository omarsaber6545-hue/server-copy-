import React, { useState } from 'react';
import { Key, Eye, EyeOff, Bot, User, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { TokenType, DiscordUser } from '../types/discord';
import { Language, translations } from '../i18n/translations';

interface TokenManagerProps {
  lang: Language;
  token: string;
  setToken: (t: string) => void;
  tokenType: TokenType;
  setTokenType: (type: TokenType) => void;
  currentUser: DiscordUser | null;
  guildCount: number;
  isLoading: boolean;
  onTestToken: () => void;
  error: string | null;
}

export const TokenManager: React.FC<TokenManagerProps> = ({
  lang,
  token,
  setToken,
  tokenType,
  setTokenType,
  currentUser,
  guildCount,
  isLoading,
  onTestToken,
  error
}) => {
  const t = translations[lang];
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="discord-card p-5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-discord-blurple/10 text-discord-blurple">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{t.tokenSection}</h2>
            <p className="text-xs text-discord-muted">
              {lang === 'ar'
                ? 'أدخل توكن البوت أو الحساب للوصول إلى السيرفرات'
                : 'Enter your bot or account token to access servers'}
            </p>
          </div>
        </div>

        {/* Token Type Switcher */}
        <div className="flex items-center bg-discord-dark p-1 rounded-xl border border-discord-card">
          <button
            type="button"
            onClick={() => setTokenType('bot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tokenType === 'bot'
                ? 'bg-discord-blurple text-white shadow-sm'
                : 'text-discord-muted hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Bot</span>
          </button>
          <button
            type="button"
            onClick={() => setTokenType('user')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tokenType === 'user'
                ? 'bg-discord-blurple text-white shadow-sm'
                : 'text-discord-muted hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>User</span>
          </button>
        </div>
      </div>

      {/* Token Input & Action Button */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t.tokenPlaceholder}
            className="w-full bg-discord-darker border border-discord-card/80 rounded-xl px-4 py-3 text-sm text-white placeholder-discord-muted/60 focus:outline-none focus:border-discord-blurple focus:ring-1 focus:ring-discord-blurple pr-12 transition-all font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 -translate-y-1/2 left-auto right-3 p-1.5 text-discord-muted hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onTestToken}
            disabled={isLoading || !token.trim()}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-discord-blurple hover:bg-discord-blurple-hover disabled:bg-discord-card disabled:text-discord-muted text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-discord-blurple/20 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === 'ar' ? 'جاري الفحص...' : 'Testing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.testToken}</span>
              </>
            )}
          </button>

          {currentUser && (
            <div className="w-full sm:w-auto flex items-center gap-3 bg-discord-darker px-4 py-2 rounded-xl border border-discord-green/30 text-xs">
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png?size=64`}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full border border-discord-green"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-discord-blurple flex items-center justify-center text-white font-bold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-discord-green rounded-full border-2 border-discord-darker" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{currentUser.username}</span>
                  {currentUser.bot && (
                    <span className="bg-discord-blurple text-[10px] font-bold text-white px-1.5 py-0.2 rounded">
                      BOT
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-discord-muted">
                  {guildCount} {lang === 'ar' ? 'سيرفر متاح' : 'guilds available'}
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-discord-green mr-auto" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-discord-red/10 border border-discord-red/30 text-discord-red p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
