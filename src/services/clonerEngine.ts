import {
  TokenType,
  DiscordRole,
  DiscordChannel,
  CloneOptionsState,
  FullGuildData,
  LogMessage,
  CloneProgress
} from '../types/discord';
import * as api from './discordApi';

export interface ClonerCallbacks {
  onLog: (log: Omit<LogMessage, 'id' | 'timestamp'>) => void;
  onProgress: (progress: Partial<CloneProgress>) => void;
  shouldContinue: () => boolean; // For cancel/pause check
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ServerClonerEngine {
  private roleIdMap = new Map<string, string>(); // oldRoleId -> newRoleId
  private categoryIdMap = new Map<string, string>(); // oldCategoryId -> newCategoryId

  constructor(
    private token: string,
    private tokenType: TokenType,
    private options: CloneOptionsState,
    private callbacks: ClonerCallbacks
  ) {}

  private log(level: LogMessage['level'], text: string, details?: string) {
    this.callbacks.onLog({ level, text, details });
  }

  private handleRateLimit(seconds: number) {
    this.log('rate-limit', `Discord Rate-Limit detected. Waiting ${seconds} seconds before resuming...`);
  }

  /**
   * Main clone runner: Clones from source server (or preloaded backup) to target server
   */
  public async clone(sourceGuildId: string, targetGuildId: string, preloadedData?: FullGuildData) {
    this.roleIdMap.clear();
    this.categoryIdMap.clear();

    // Map the @everyone role (which has the guild ID itself)
    this.roleIdMap.set(sourceGuildId, targetGuildId);

    try {
      this.callbacks.onProgress({
        status: 'running',
        percentage: 5,
        currentStep: 'Fetching source server data...'
      });
      this.log('info', `Starting clone process from [${sourceGuildId}] to [${targetGuildId}]`);

      // 1. Fetch source server data if not provided
      let data: FullGuildData;
      if (preloadedData) {
        data = preloadedData;
        this.log('success', `Using preloaded backup data: "${data.guild.name}"`);
      } else {
        data = await api.fetchFullGuildData(sourceGuildId, this.token, this.tokenType, (step) => {
          this.log('info', step);
        });
        this.log('success', `Fetched ${data.roles.length} roles, ${data.channels.length} channels, ${data.emojis.length} emojis, ${data.stickers.length} stickers.`);
      }

      if (!this.callbacks.shouldContinue()) {
        this.log('warning', 'Clone process was cancelled by user.');
        this.callbacks.onProgress({ status: 'cancelled' });
        return;
      }

      // Calculate total steps for progress calculation
      const totalRoles = this.options.cloneRoles ? data.roles.filter(r => !r.managed && r.id !== sourceGuildId).length : 0;
      const categories = data.channels.filter(c => c.type === 4);
      const normalChannels = data.channels.filter(c => c.type !== 4);
      const totalCategories = this.options.cloneCategories ? categories.length : 0;
      const totalChannels = this.options.cloneChannels ? normalChannels.length : 0;
      const totalEmojis = this.options.cloneEmojis ? data.emojis.length : 0;
      const totalStickers = this.options.cloneStickers ? data.stickers.length : 0;

      let completedWork = 0;
      const totalWork = (this.options.cleanTargetServer ? 10 : 0) +
        (this.options.cloneServerInfo ? 5 : 0) +
        totalRoles + totalCategories + totalChannels + totalEmojis + totalStickers + 5;

      const updateProgress = (stepName: string, inc = 1) => {
        completedWork += inc;
        const pct = Math.min(99, Math.round((completedWork / Math.max(1, totalWork)) * 100));
        this.callbacks.onProgress({
          percentage: pct,
          currentStep: stepName
        });
      };

      // 2. Clean target server if option is enabled
      if (this.options.cleanTargetServer) {
        this.log('warning', 'Cleaning existing channels and roles from target server...');
        await this.cleanTargetServer(targetGuildId);
        updateProgress('Target server cleaned', 10);
      }

      // 3. Clone Server General Info (Name, Icon, Banner)
      if (this.options.cloneServerInfo) {
        this.log('info', `Updating server settings to match "${data.guild.name}"...`);
        let iconBase64: string | null = null;
        if (data.guild.icon) {
          const iconUrl = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png?size=1024`;
          iconBase64 = await api.imageUrlToBase64(iconUrl);
        }

        let bannerBase64: string | null = null;
        if (data.guild.banner) {
          const bannerUrl = `https://cdn.discordapp.com/banners/${data.guild.id}/${data.guild.banner}.png?size=1024`;
          bannerBase64 = await api.imageUrlToBase64(bannerUrl);
        }

        await api.updateGuild(
          targetGuildId,
          {
            name: data.guild.name,
            icon: iconBase64,
            banner: bannerBase64
          },
          this.token,
          this.tokenType,
          this.handleRateLimit.bind(this)
        );
        this.log('success', `Updated server name and icon successfully!`);
        updateProgress('Server info cloned', 5);
      }

      // 4. Clone Roles
      if (this.options.cloneRoles) {
        this.log('info', `Cloning ${totalRoles} roles...`);
        // Sort roles by position ascending so they're created in order
        const rolesToClone = [...data.roles]
          .filter(r => !r.managed && r.id !== data.guild.id)
          .sort((a, b) => a.position - b.position);

        let rolesDone = 0;
        for (const role of rolesToClone) {
          if (!this.callbacks.shouldContinue()) return;

          try {
            const newRole = await api.createRole(
              targetGuildId,
              {
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions
              },
              this.token,
              this.tokenType,
              this.handleRateLimit.bind(this)
            );

            this.roleIdMap.set(role.id, newRole.id);
            rolesDone++;
            this.callbacks.onProgress({
              rolesCount: { total: totalRoles, done: rolesDone }
            });
            this.log('success', `Created role: "${role.name}"`);
          } catch (err: any) {
            this.log('error', `Failed to create role "${role.name}": ${err.message}`);
          }

          await sleep(this.options.delayBetweenRequests);
          updateProgress(`Cloning roles (${rolesDone}/${totalRoles})`, 1);
        }
      }

      // 5. Clone Categories
      if (this.options.cloneCategories) {
        this.log('info', `Cloning ${categories.length} categories...`);
        // Sort categories by position
        const sortedCats = [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));

        let catsDone = 0;
        for (const cat of sortedCats) {
          if (!this.callbacks.shouldContinue()) return;

          try {
            const mappedOverwrites = this.mapPermissionOverwrites(cat.permission_overwrites);
            const newCat = await api.createChannel(
              targetGuildId,
              {
                name: cat.name,
                type: 4, // Category
                position: cat.position,
                permission_overwrites: this.options.clonePermissions ? mappedOverwrites : []
              },
              this.token,
              this.tokenType,
              this.handleRateLimit.bind(this)
            );

            this.categoryIdMap.set(cat.id, newCat.id);
            catsDone++;
            this.callbacks.onProgress({
              categoriesCount: { total: totalCategories, done: catsDone }
            });
            this.log('success', `Created category: "${cat.name}"`);
          } catch (err: any) {
            this.log('error', `Failed to create category "${cat.name}": ${err.message}`);
          }

          await sleep(this.options.delayBetweenRequests);
          updateProgress(`Cloning categories (${catsDone}/${totalCategories})`, 1);
        }
      }

      // 6. Clone Channels
      if (this.options.cloneChannels) {
        this.log('info', `Cloning ${normalChannels.length} channels...`);
        const sortedChannels = [...normalChannels].sort((a, b) => (a.position || 0) - (b.position || 0));

        let channelsDone = 0;
        for (const chan of sortedChannels) {
          if (!this.callbacks.shouldContinue()) return;

          try {
            const mappedParentId = chan.parent_id ? (this.categoryIdMap.get(chan.parent_id) || null) : null;
            const mappedOverwrites = this.mapPermissionOverwrites(chan.permission_overwrites);

            const channelPayload: Partial<DiscordChannel> = {
              name: chan.name,
              type: chan.type,
              position: chan.position,
              topic: chan.topic,
              nsfw: chan.nsfw,
              parent_id: mappedParentId,
              permission_overwrites: this.options.clonePermissions ? mappedOverwrites : []
            };

            if (chan.type === 2 || chan.type === 13) { // Voice or Stage
              if (this.options.cloneVoiceSettings) {
                channelPayload.bitrate = chan.bitrate;
                channelPayload.user_limit = chan.user_limit;
              }
            } else {
              channelPayload.rate_limit_per_user = chan.rate_limit_per_user;
            }

            await api.createChannel(
              targetGuildId,
              channelPayload,
              this.token,
              this.tokenType,
              this.handleRateLimit.bind(this)
            );

            channelsDone++;
            this.callbacks.onProgress({
              channelsCount: { total: totalChannels, done: channelsDone }
            });
            this.log('success', `Created channel: #${chan.name}`);
          } catch (err: any) {
            this.log('error', `Failed to create channel "${chan.name}": ${err.message}`);
          }

          await sleep(this.options.delayBetweenRequests);
          updateProgress(`Cloning channels (${channelsDone}/${totalChannels})`, 1);
        }
      }

      // 7. Clone Custom Emojis
      if (this.options.cloneEmojis && data.emojis.length > 0) {
        this.log('info', `Cloning ${data.emojis.length} emojis...`);
        let emojisDone = 0;

        for (const emoji of data.emojis) {
          if (!this.callbacks.shouldContinue()) return;

          try {
            const ext = emoji.animated ? 'gif' : 'png';
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=96`;
            const base64Data = await api.imageUrlToBase64(emojiUrl);

            if (base64Data) {
              await api.createEmoji(
                targetGuildId,
                {
                  name: emoji.name.replace(/[^a-zA-Z0-9_]/g, '_'),
                  image: base64Data
                },
                this.token,
                this.tokenType,
                this.handleRateLimit.bind(this)
              );

              emojisDone++;
              this.callbacks.onProgress({
                emojisCount: { total: totalEmojis, done: emojisDone }
              });
              this.log('success', `Cloned emoji: :${emoji.name}:`);
            }
          } catch (err: any) {
            this.log('error', `Failed to clone emoji "${emoji.name}": ${err.message}`);
          }

          await sleep(this.options.delayBetweenRequests + 200);
          updateProgress(`Cloning emojis (${emojisDone}/${totalEmojis})`, 1);
        }
      }

      // 8. Clone Custom Stickers
      if (this.options.cloneStickers && data.stickers.length > 0) {
        this.log('info', `Cloning ${data.stickers.length} stickers...`);
        let stickersDone = 0;

        for (const sticker of data.stickers) {
          if (!this.callbacks.shouldContinue()) return;

          try {
            const ext = sticker.format_type === 4 ? 'gif' : 'png';
            const stickerUrl = `https://cdn.discordapp.com/stickers/${sticker.id}.${ext}`;
            const base64Data = await api.imageUrlToBase64(stickerUrl);

            if (base64Data) {
              await api.createSticker(
                targetGuildId,
                {
                  name: sticker.name,
                  tags: sticker.tags || 'sticker',
                  description: sticker.description || undefined,
                  fileBase64: base64Data,
                  format: sticker.format_type
                },
                this.token,
                this.tokenType,
                this.handleRateLimit.bind(this)
              );

              stickersDone++;
              this.callbacks.onProgress({
                stickersCount: { total: totalStickers, done: stickersDone }
              });
              this.log('success', `Cloned sticker: "${sticker.name}"`);
            }
          } catch (err: any) {
            this.log('error', `Failed to clone sticker "${sticker.name}": ${err.message}`);
          }

          await sleep(this.options.delayBetweenRequests + 300);
          updateProgress(`Cloning stickers (${stickersDone}/${totalStickers})`, 1);
        }
      }

      // Finished!
      this.callbacks.onProgress({
        status: 'completed',
        percentage: 100,
        currentStep: 'Cloning completed successfully!'
      });
      this.log('success', '🎉 ALL TASKS COMPLETED! Server has been fully cloned.');
    } catch (err: any) {
      this.log('error', `Critical Error: ${err.message}`);
      this.callbacks.onProgress({
        status: 'error',
        currentStep: `Error: ${err.message}`
      });
    }
  }

  /**
   * Delete existing channels and roles from target server
   */
  private async cleanTargetServer(guildId: string) {
    try {
      // 1. Delete channels
      const channels = await api.getGuildChannels(guildId, this.token, this.tokenType);
      for (const channel of channels) {
        if (!this.callbacks.shouldContinue()) return;
        try {
          await api.deleteChannel(channel.id, this.token, this.tokenType, this.handleRateLimit.bind(this));
          this.log('info', `Deleted existing channel: #${channel.name}`);
        } catch (e: any) {
          this.log('warning', `Could not delete channel #${channel.name}: ${e.message}`);
        }
        await sleep(300);
      }

      // 2. Delete roles (excluding @everyone and bot-managed roles)
      const roles = await api.getGuildRoles(guildId, this.token, this.tokenType);
      for (const role of roles) {
        if (!this.callbacks.shouldContinue()) return;
        if (role.id === guildId || role.managed) continue;

        try {
          await api.deleteRole(guildId, role.id, this.token, this.tokenType, this.handleRateLimit.bind(this));
          this.log('info', `Deleted existing role: "${role.name}"`);
        } catch (e: any) {
          this.log('warning', `Could not delete role "${role.name}": ${e.message}`);
        }
        await sleep(300);
      }
    } catch (e: any) {
      this.log('error', `Error while cleaning target server: ${e.message}`);
    }
  }

  /**
   * Maps old role IDs in permission overwrites to the newly created role IDs
   */
  private mapPermissionOverwrites(overwrites?: DiscordChannel['permission_overwrites']) {
    if (!overwrites || !Array.isArray(overwrites)) return [];

    return overwrites
      .map((ow) => {
        // If overwrite is for a role (type 0)
        if (ow.type === 0) {
          const newRoleId = this.roleIdMap.get(ow.id);
          if (!newRoleId) return null; // Role wasn't cloned or doesn't exist
          return {
            id: newRoleId,
            type: 0,
            allow: ow.allow,
            deny: ow.deny
          };
        }
        // Member overwrites (type 1) are skipped because member IDs might not match
        return null;
      })
      .filter(Boolean) as DiscordChannel['permission_overwrites'];
  }
}
