import {
  Client,
  Collection,
  Guild,
  GuildBasedChannel,
  GuildMember,
  PermissionsBitField,
  TextChannel,
  NewsChannel,
  ThreadChannel,
  Message,
} from "discord.js";
import { DISCORD_LIMITS } from "../../constants/botConstants";

export interface ChannelSearchOptions {
  type?: number;
  name?: string;
  categoryId?: string;
  permissions?: PermissionsBitField;
}

export interface MemberSearchOptions {
  username?: string;
  displayName?: string;
  roles?: string[];
  permissions?: PermissionsBitField;
  isBot?: boolean;
};

export const deleteAllMessages = async (
  channel: TextChannel | NewsChannel | ThreadChannel,
  olderThan?: Date
): Promise<number> => {
  let deleted = 0;
  const cutoff = olderThan || new Date(Date.now() - DISCORD_LIMITS.BULK_DELETE_AGE_LIMIT);
  let fetched: Collection<string, Message>;
  do {
    fetched = await channel.messages.fetch({ limit: DISCORD_LIMITS.BULK_DELETE_MAX });
    if (fetched.size === 0) break;
    const bulkable = fetched.filter((m) => m.createdTimestamp > cutoff.getTime());
    if (bulkable.size > 1) {
      await channel.bulkDelete(bulkable, true);
      deleted += bulkable.size;
    } else {
      for (const msg of bulkable.values()) {
        await msg.delete().catch(() => {});
        deleted++;
      }
    }
    const old = fetched.filter((m) => m.createdTimestamp <= cutoff.getTime());
    for (const msg of old.values()) {
      await msg.delete().catch(() => {});
      deleted++;
    }
  } while (fetched.size >= 2);
  return deleted;
};

export const fetchAllMembers = async (
  guild: Guild,
  force = false
): Promise<Collection<string, GuildMember>> => {
  if (!force && guild.members.cache.size > 0) return guild.members.cache;
  return guild.members.fetch();
};

export const fetchAllChannels = async (
  guild: Guild,
  force = false
): Promise<Collection<string, GuildBasedChannel>> => {
  if (!force && guild.channels.cache.size > 0) return guild.channels.cache;
  return guild.channels.fetch();
};

export const fetchAllGuilds = async (
  client: Client
): Promise<Collection<string, Guild>> => {
  const guilds = new Collection<string, Guild>();
  const oauthGuilds = await client.guilds.fetch();
  for (const id of oauthGuilds.keys()) {
    try {
      const g = await client.guilds.fetch(id);
      if (g instanceof Guild) guilds.set(id, g);
    } catch {}
  }
  return guilds;
};

export const findChannels = (
  guild: Guild,
  options: ChannelSearchOptions
): Collection<string, GuildBasedChannel> => {
  let chans = guild.channels.cache;
  if (options.type) chans = chans.filter((c) => c.type === options.type);
  if (options.name) {
    const re = new RegExp(options.name, "i");
    chans = chans.filter((c) => re.test(c.name));
  }
  if (options.categoryId) {
    chans = chans.filter((c) => "parentId" in c && c.parentId === options.categoryId);
  }
  return chans;
};

export const findMembers = (
  guild: Guild,
  options: MemberSearchOptions
): Collection<string, GuildMember> => {
  let mems = guild.members.cache;
  if (options.username) {
    const re = new RegExp(options.username, "i");
    mems = mems.filter((m) => re.test(m.user.username));
  }
  if (options.displayName) {
    const re = new RegExp(options.displayName, "i");
    mems = mems.filter((m) => re.test(m.displayName));
  }
  if (options.roles) {
    mems = mems.filter((m) => options.roles!.some((r) => m.roles.cache.has(r)));
  }
  if (typeof options.isBot === "boolean") {
    mems = mems.filter((m) => m.user.bot === options.isBot);
  }
  return mems;
};

export const hasPermission = (
  member: GuildMember,
  perm: PermissionsBitField | string,
  channel?: GuildBasedChannel
): boolean => {
  try {
    if (channel && "permissionsFor" in channel) {
      return channel.permissionsFor(member)?.has(perm as any) ?? false;
    }
    return member.permissions.has(perm as any);
  } catch {
    return false;
  }
};

export const getMemberAvatarURL = (
  member: GuildMember,
  options?: { size?: number; format?: "webp" | "png" | "jpg" | "jpeg" | "gif" }
): string => {
  const size = options?.size || 256;
  const format = options?.format || "webp";
  return (
    member.displayAvatarURL({ size, extension: format }) ||
    member.user.displayAvatarURL({ size, extension: format }) ||
    member.user.defaultAvatarURL
  );
};
