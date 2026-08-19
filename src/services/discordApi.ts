import {
  TokenType,
  DiscordUser,
  DiscordGuild,
  DiscordRole,
  DiscordChannel,
  DiscordEmoji,
  DiscordSticker,
  FullGuildData
} from '../types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'DiscordApiError';
  }
}

export const getAuthHeader = (token: string, type: TokenType): Record<string, string> => {
  const cleanToken = token.trim();
  return {
    Authorization: type === 'bot' ? `Bot ${cleanToken}` : cleanToken,
    'Content-Type': 'application/json'
  };
};

/**
 * Robust fetch wrapper with rate-limit handling and error extraction
 */
export async function discordFetch<T>(
  url: string,
  token: string,
  type: TokenType,
  options: RequestInit = {},
  onRateLimit?: (seconds: number) => void
): Promise<T> {
  const headers = {
    ...getAuthHeader(token, type),
    ...(options.headers || {})
  };

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(`${DISCORD_API_BASE}${url}`, {
        ...options,
        headers
      });

      if (response.status === 429) {
        const rateLimitData = await response.json().catch(() => ({ retry_after: 2 }));
        const retryAfterSec = Number(rateLimitData.retry_after || 2);
        if (onRateLimit) {
          onRateLimit(retryAfterSec);
        }
        // Wait retry-after seconds + buffer
        await new Promise((resolve) => setTimeout(resolve, Math.ceil(retryAfterSec * 1000) + 200));
        continue;
      }

      if (response.status === 204) {
        return {} as T;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new DiscordApiError(
          response.status,
          errorBody.message || `Request failed with status ${response.status}`,
          errorBody.code
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof DiscordApiError) {
        throw err;
      }
      if (attempts >= maxAttempts) {
        throw new Error(err.message || 'Network request failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Maximum request attempts exceeded');
}

/**
 * Fetch current authenticated user / bot info
 */
export async function getCurrentUser(token: string, type: TokenType): Promise<DiscordUser> {
  return discordFetch<DiscordUser>('/users/@me', token, type);
}

/**
 * Fetch list of guilds current user / bot is in
 */
export async function getUserGuilds(token: string, type: TokenType): Promise<DiscordGuild[]> {
  return discordFetch<DiscordGuild[]>('/users/@me/guilds?limit=200', token, type);
}

/**
 * Fetch specific guild info
 */
export async function getGuild(guildId: string, token: string, type: TokenType): Promise<DiscordGuild> {
  return discordFetch<DiscordGuild>(`/guilds/${guildId}?with_counts=true`, token, type);
}

/**
 * Fetch all guild roles
 */
export async function getGuildRoles(guildId: string, token: string, type: TokenType): Promise<DiscordRole[]> {
  return discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, token, type);
}

/**
 * Fetch all guild channels
 */
export async function getGuildChannels(guildId: string, token: string, type: TokenType): Promise<DiscordChannel[]> {
  return discordFetch<DiscordChannel[]>(`/guilds/${guildId}/channels`, token, type);
}

/**
 * Fetch all guild emojis
 */
export async function getGuildEmojis(guildId: string, token: string, type: TokenType): Promise<DiscordEmoji[]> {
  return discordFetch<DiscordEmoji[]>(`/guilds/${guildId}/emojis`, token, type);
}

/**
 * Fetch all guild stickers
 */
export async function getGuildStickers(guildId: string, token: string, type: TokenType): Promise<DiscordSticker[]> {
  return discordFetch<DiscordSticker[]>(`/guilds/${guildId}/stickers`, token, type);
}

/**
 * Fetch complete guild bundle (Guild, Roles, Channels, Emojis, Stickers)
 */
export async function fetchFullGuildData(
  guildId: string,
  token: string,
  type: TokenType,
  onProgress?: (step: string) => void
): Promise<FullGuildData> {
  onProgress?.('Fetching guild info...');
  const guild = await getGuild(guildId, token, type);

  onProgress?.('Fetching guild roles...');
  const roles = await getGuildRoles(guildId, token, type);

  onProgress?.('Fetching guild channels & categories...');
  const channels = await getGuildChannels(guildId, token, type);

  onProgress?.('Fetching guild emojis...');
  let emojis: DiscordEmoji[] = [];
  try {
    emojis = await getGuildEmojis(guildId, token, type);
  } catch (e) {
    console.warn('Could not fetch emojis', e);
  }

  onProgress?.('Fetching guild stickers...');
  let stickers: DiscordSticker[] = [];
  try {
    stickers = await getGuildStickers(guildId, token, type);
  } catch (e) {
    console.warn('Could not fetch stickers', e);
  }

  return {
    guild,
    roles,
    channels,
    emojis,
    stickers
  };
}

/**
 * Create a new role in guild
 */
export async function createRole(
  guildId: string,
  roleData: Partial<DiscordRole>,
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<DiscordRole> {
  return discordFetch<DiscordRole>(
    `/guilds/${guildId}/roles`,
    token,
    type,
    {
      method: 'POST',
      body: JSON.stringify({
        name: roleData.name,
        permissions: roleData.permissions,
        color: roleData.color || 0,
        hoist: roleData.hoist || false,
        mentionable: roleData.mentionable || false,
        icon: roleData.icon || null,
        unicode_emoji: roleData.unicode_emoji || null
      })
    },
    onRateLimit
  );
}

/**
 * Delete a role in guild
 */
export async function deleteRole(
  guildId: string,
  roleId: string,
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<void> {
  return discordFetch<void>(
    `/guilds/${guildId}/roles/${roleId}`,
    token,
    type,
    { method: 'DELETE' },
    onRateLimit
  );
}

/**
 * Create a channel or category in guild
 */
export async function createChannel(
  guildId: string,
  channelData: Partial<DiscordChannel>,
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<DiscordChannel> {
  return discordFetch<DiscordChannel>(
    `/guilds/${guildId}/channels`,
    token,
    type,
    {
      method: 'POST',
      body: JSON.stringify(channelData)
    },
    onRateLimit
  );
}

/**
 * Delete a channel in guild
 */
export async function deleteChannel(
  channelId: string,
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<void> {
  return discordFetch<void>(
    `/channels/${channelId}`,
    token,
    type,
    { method: 'DELETE' },
    onRateLimit
  );
}

/**
 * Upload an emoji to guild
 */
export async function createEmoji(
  guildId: string,
  emojiData: { name: string; image: string },
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<DiscordEmoji> {
  return discordFetch<DiscordEmoji>(
    `/guilds/${guildId}/emojis`,
    token,
    type,
    {
      method: 'POST',
      body: JSON.stringify(emojiData)
    },
    onRateLimit
  );
}

/**
 * Upload a sticker to guild
 */
export async function createSticker(
  guildId: string,
  stickerData: { name: string; description?: string; tags: string; fileBase64: string; format: number },
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<DiscordSticker> {
  // We send multipart form data for stickers
  const cleanToken = token.trim();
  const auth = type === 'bot' ? `Bot ${cleanToken}` : cleanToken;

  const formData = new FormData();
  formData.append('name', stickerData.name);
  formData.append('tags', stickerData.tags || 'sticker');
  if (stickerData.description) {
    formData.append('description', stickerData.description);
  }

  // Convert base64 data to blob
  const response = await fetch(stickerData.fileBase64);
  const blob = await response.blob();
  const ext = stickerData.format === 4 ? 'gif' : 'png';
  formData.append('file', blob, `sticker.${ext}`);

  const res = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/stickers`, {
    method: 'POST',
    headers: {
      Authorization: auth
    },
    body: formData
  });

  if (res.status === 429) {
    const rateLimitData = await res.json().catch(() => ({ retry_after: 2 }));
    const retryAfterSec = Number(rateLimitData.retry_after || 2);
    if (onRateLimit) onRateLimit(retryAfterSec);
    await new Promise((r) => setTimeout(r, Math.ceil(retryAfterSec * 1000) + 200));
    return createSticker(guildId, stickerData, token, type, onRateLimit);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new DiscordApiError(res.status, err.message || 'Failed to create sticker');
  }

  return (await res.json()) as DiscordSticker;
}

/**
 * Update general guild settings (name, icon, banner, etc.)
 */
export async function updateGuild(
  guildId: string,
  updateData: { name?: string; icon?: string | null; banner?: string | null },
  token: string,
  type: TokenType,
  onRateLimit?: (sec: number) => void
): Promise<DiscordGuild> {
  return discordFetch<DiscordGuild>(
    `/guilds/${guildId}`,
    token,
    type,
    {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    },
    onRateLimit
  );
}

/**
 * Convert any remote image/asset URL to a base64 Data URI
 */
export async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`Failed to convert image to base64: ${url}`, e);
    return null;
  }
}
