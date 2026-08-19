import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Play,
  Layers
} from 'lucide-react';
import { TokenType, FullGuildData, DiscordGuild } from '../types/discord';
import { Language, translations } from '../i18n/translations';
import * as api from '../services/discordApi';

interface BackupManagerProps {
  lang: Language;
  token: string;
  tokenType: TokenType;
  guilds: DiscordGuild[];
  onStartRestoreFromData: (backupData: FullGuildData, targetGuildId: string) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  lang,
  token,
  tokenType,
  guilds,
  onStartRestoreFromData
}) => {
  const t = translations[lang];
  const [exportGuildId, setExportGuildId] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const [importedData, setImportedData] = useState<FullGuildData | null>(null);
  const [importTargetGuildId, setImportTargetGuildId] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export server to JSON
  const handleExportBackup = async () => {
    if (!exportGuildId || !token) return;
    setIsExporting(true);
    setExportMessage(lang === 'ar' ? 'جاري استخراج بيانات السيرفر بالكامل...' : 'Exporting server data...');

    try {
      const data = await api.fetchFullGuildData(exportGuildId, token, tokenType);
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const safeName = data.guild.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
      a.download = `discord_backup_${safeName}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportMessage(lang === 'ar' ? 'تم تنزيل ملف النسخة الاحتياطية بنجاح! ✅' : 'Backup downloaded successfully! ✅');
    } catch (e: any) {
      setExportMessage(lang === 'ar' ? `فشل التصدير: ${e.message}` : `Export failed: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.guild || !parsed.roles || !parsed.channels) {
          throw new Error('الملف ليس ملف نسخة احتياطية صالح لسيرفر ديسكورد.');
        }
        setImportedData(parsed);
        setImportError(null);
      } catch (err: any) {
        setImportError(err.message || 'Invalid JSON file');
        setImportedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleStartImportClone = () => {
    if (!importedData || !importTargetGuildId) return;
    onStartRestoreFromData(importedData, importTargetGuildId);
  };

  return (
    <div className="space-y-6">
      
      {/* Export Section */}
      <div className="discord-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.exportBackup}</h3>
            <p className="text-xs text-discord-muted">{t.exportBackupDesc}</p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <select
            value={exportGuildId}
            onChange={(e) => setExportGuildId(e.target.value)}
            className="w-full bg-discord-darker border border-discord-card rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-discord-blurple"
          >
            <option value="">-- {lang === 'ar' ? 'اختر السيرفر المراد حفظ نسخته الاحتياطية' : 'Select server to export'} --</option>
            {guilds.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.id})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportBackup}
            disabled={!exportGuildId || isExporting || !token}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-discord-card disabled:text-discord-muted text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{exportMessage}</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تنزيل ملف النسخة الاحتياطية (Backup JSON)' : 'Download Backup File'}</span>
              </>
            )}
          </button>

          {exportMessage && !isExporting && (
            <p className="text-xs text-discord-green bg-discord-green/10 p-2.5 rounded-xl border border-discord-green/20">
              {exportMessage}
            </p>
          )}
        </div>
      </div>

      {/* Import / Restore Section */}
      <div className="discord-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.importBackup}</h3>
            <p className="text-xs text-discord-muted">{t.importBackupDesc}</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-4 mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-discord-card hover:border-purple-500/50 rounded-2xl bg-discord-darker hover:bg-purple-500/5 transition-all cursor-pointer group"
          >
            <Layers className="w-8 h-8 text-discord-muted group-hover:text-purple-400 mb-2 transition-colors" />
            <span className="text-xs font-bold text-white">
              {lang === 'ar' ? 'اضغط لاختيار ملف النسخة الاحتياطية (.json)' : 'Click to select backup .json file'}
            </span>
            <span className="text-[11px] text-discord-muted mt-1">
              JSON File containing roles, channels, emojis, and stickers
            </span>
          </button>

          {importError && (
            <div className="flex items-center gap-2 bg-discord-red/10 border border-discord-red/30 text-discord-red p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importedData && (
            <div className="bg-discord-darker p-4 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">
                  {lang === 'ar' ? 'بيانات النسخة الاحتياطية المحملة:' : 'Loaded Backup Data:'} {importedData.guild.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-discord-card p-2 rounded-lg text-center">
                  <span className="text-discord-muted block">{t.statusRoles}</span>
                  <span className="font-bold text-white">{importedData.roles.length}</span>
                </div>
                <div className="bg-discord-card p-2 rounded-lg text-center">
                  <span className="text-discord-muted block">{t.statusChannels}</span>
                  <span className="font-bold text-white">{importedData.channels.length}</span>
                </div>
                <div className="bg-discord-card p-2 rounded-lg text-center">
                  <span className="text-discord-muted block">{t.statusEmojis}</span>
                  <span className="font-bold text-white">{importedData.emojis.length}</span>
                </div>
                <div className="bg-discord-card p-2 rounded-lg text-center">
                  <span className="text-discord-muted block">{t.statusStickers}</span>
                  <span className="font-bold text-white">{importedData.stickers.length}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-discord-card">
                <label className="text-xs font-bold text-discord-muted block mb-1">
                  {lang === 'ar' ? 'اختر السيرفر الهدف المراد تطبيق هذه النسخة عليه:' : 'Select target server to restore backup into:'}
                </label>
                <select
                  value={importTargetGuildId}
                  onChange={(e) => setImportTargetGuildId(e.target.value)}
                  className="w-full bg-discord-dark border border-discord-card rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- {t.selectTarget} --</option>
                  {guilds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartImportClone}
                disabled={!importTargetGuildId}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-discord-card disabled:text-discord-muted text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-purple-600/20 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'ar' ? 'تطبيق النسخة على السيرفر الهدف الآن' : 'Restore Backup to Server Now'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
