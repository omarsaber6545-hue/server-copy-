import React from 'react';
import { Bot, User, Shield, Smartphone, ExternalLink, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HelpGuideProps {
  lang: Language;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      
      {/* APK Download Banner */}
      <div className="discord-card p-5 border-l-4 border-discord-green bg-gradient-to-r from-discord-card to-discord-green/5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-discord-green/20 text-discord-green shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {t.howToApk}
              <span className="bg-discord-green/20 text-discord-green text-xs px-2 py-0.5 rounded-full border border-discord-green/30">
                Android APK
              </span>
            </h3>
            <p className="text-xs text-discord-text leading-relaxed">
              {t.apkDownloadNotice}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/omarsaber6545-hue/server-copy-/releases"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-discord-green hover:bg-emerald-600 text-discord-darker font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md shadow-discord-green/20"
              >
                <span>{lang === 'ar' ? 'صفحة تحميل الـ APK من GitHub Releases' : 'Download APK from Releases'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/omarsaber6545-hue/server-copy-/actions"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-discord-darker hover:bg-discord-hover text-discord-text text-xs py-2 px-4 rounded-xl border border-discord-card transition-all"
              >
                <span>{lang === 'ar' ? 'سجل بناء GitHub Actions' : 'GitHub Actions Builds'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Guide 1: Discord Bot Token */}
      <div className="discord-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-discord-blurple/10 text-discord-blurple">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.howToBot}</h3>
            <span className="text-xs text-discord-green font-semibold">
              {lang === 'ar' ? 'الطريقة الآمنة والمستحسنة' : 'Safe & Recommended Method'}
            </span>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs text-discord-text mt-3 bg-discord-darker p-4 rounded-xl border border-discord-card/60">
          <li>
            {lang === 'ar' ? 'افتح بوابة مطوري ديسكورد: ' : 'Open Discord Developer Portal: '}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noreferrer"
              className="text-discord-blurple underline font-bold inline-flex items-center gap-1"
            >
              discord.com/developers/applications <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>{lang === 'ar' ? 'اضغط على New Application وأدخل اسماً للتطبيق.' : 'Click New Application and enter a name.'}</li>
          <li>{lang === 'ar' ? 'من القائمة الجانبية اختر تبويب Bot ثم اضغط Reset Token وانسخ التوكن.' : 'Go to the Bot tab from sidebar, click Reset Token, and copy it.'}</li>
          <li>
            {lang === 'ar' ? (
              <span className="text-discord-yellow font-medium">
                تأكد من تفعيل خيارات Privileged Gateway Intents (Server Members Intent, Message Content Intent).
              </span>
            ) : (
              <span className="text-discord-yellow font-medium">
                Enable Privileged Gateway Intents (Server Members Intent, Message Content Intent).
              </span>
            )}
          </li>
        </ol>
      </div>

      {/* Guide 2: Invite Bot with Admin */}
      <div className="discord-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.howToInvite}</h3>
          </div>
        </div>

        <div className="space-y-3 text-xs text-discord-text bg-discord-darker p-4 rounded-xl border border-discord-card/60">
          <p>
            {lang === 'ar'
              ? 'لكي يتمكن البوت من قراءة وتكرار الرتب والقنوات والإيموجي في السيرفرين، يجب أن يكون موجوداً في السيرفر المصدر والسيرفر الهدف مع صلاحية Administrator ورتبته في أعلى قائمة الرتب.'
              : 'For the bot to clone roles, channels, emojis, and stickers, it must be invited to both servers with Administrator permission, with its role positioned at the top of the role list.'}
          </p>
          <div className="bg-discord-card p-3 rounded-lg border border-purple-500/20 font-mono text-[11px] text-discord-muted break-all">
            https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
          </div>
        </div>
      </div>

      {/* Guide 3: User Token */}
      <div className="discord-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.howToUser}</h3>
          </div>
        </div>

        <div className="space-y-3 text-xs text-discord-text bg-discord-darker p-4 rounded-xl border border-discord-card/60">
          <div className="flex items-center gap-2 text-discord-yellow bg-discord-yellow/10 p-2.5 rounded-lg border border-discord-yellow/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'ملاحظة: لا تشارك التوكن الخاص بك مع أي شخص أبداً. التطبيق يعمل من جهازك مباشرة دون إرسال التوكن إلى أي خادم خارجي.'
                : 'Notice: Never share your token with anyone. This app runs locally on your device and never transmits your token to any third-party server.'}
            </span>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-discord-muted">
            <li>{lang === 'ar' ? 'افتح ديسكورد في متصفح الويب (Chrome أو Edge أو Firefox).' : 'Open Discord in web browser.'}</li>
            <li>{lang === 'ar' ? 'اضغط F12 أو Ctrl+Shift+I لفتح DevTools.' : 'Press F12 or Ctrl+Shift+I to open DevTools.'}</li>
            <li>{lang === 'ar' ? 'انتقل إلى تبويب Console واكتب الكود التالي للحصول على التوكن:' : 'Go to Console tab and paste this script:'}</li>
          </ol>

          <pre className="bg-discord-card p-3 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto select-all">
            {`window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  (req) => {
    for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) {
      if (m.default && m.default.getToken !== undefined) {
        return console.log('%cTOKEN: ' + m.default.getToken(), 'color: #57F287; font-size: 14px;');
      }
    }
  }
]);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
