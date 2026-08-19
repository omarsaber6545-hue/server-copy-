export type TokenType = 'bot' | 'user';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
}

export interface DiscordPermissionOverwrite {
  id: string;
  type: number; // 0 = role, 1 = member
  allow: string;
  deny: string;
}

export interface DiscordChannel {
  id: string;
  type: number; // 0=GUILD_TEXT, 2=GUILD_VOICE, 4=GUILD_CATEGORY, 5=GUILD_ANNOUNCEMENT, 13=GUILD_STAGE_VOICE, 15=GUILD_FORUM
  name: string;
  position?: number;
  parent_id?: string | null;
  topic?: string | null;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  bitrate?: number;
  user_limit?: number;
  permission_overwrites?: DiscordPermissionOverwrite[];
}

export interface DiscordEmoji {
  id: string;
  name: string;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface DiscordSticker {
  id: string;
  name: string;
  description?: string | null;
  tags: string;
  type: number;
  format_type: number; // 1=PNG, 2=APNG, 3=LOTTIE, 4=GIF
  available?: boolean;
  guild_id?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  description?: string | null;
  banner?: string | null;
  splash?: string | null;
  owner?: boolean;
  permissions?: string;
  features?: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export interface FullGuildData {
  guild: DiscordGuild;
  roles: DiscordRole[];
  channels: DiscordChannel[];
  emojis: DiscordEmoji[];
  stickers: DiscordSticker[];
}

export interface CloneOptionsState {
  cloneServerInfo: boolean;
  cleanTargetServer: boolean;
  cloneRoles: boolean;
  cloneCategories: boolean;
  cloneChannels: boolean;
  cloneEmojis: boolean;
  cloneStickers: boolean;
  cloneVoiceSettings: boolean;
  clonePermissions: boolean;
  delayBetweenRequests: number; // ms delay to avoid rate limits
}

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'rate-limit';

export interface LogMessage {
  id: string;
  timestamp: string;
  level: LogLevel;
  text: string;
  details?: string;
}

export interface CloneProgress {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  currentStep: string;
  percentage: number;
  totalItems: number;
  completedItems: number;
  rolesCount: { total: number; done: number };
  categoriesCount: { total: number; done: number };
  channelsCount: { total: number; done: number };
  emojisCount: { total: number; done: number };
  stickersCount: { total: number; done: number };
}
