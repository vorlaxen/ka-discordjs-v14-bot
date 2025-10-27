import {
  TextChannel,
  DMChannel,
  NewsChannel,
  ThreadChannel,
  Message,
  Interaction,
  EmbedBuilder,
  InteractionReplyOptions,
  ActionRowBuilder,
  ButtonBuilder,
  MessageCreateOptions,
  MessageFlags,
} from "discord.js";
import logger from "../../infrastructure/Logger";
import { DISCORD_LIMITS } from "../../constants/botConstants";

export interface MessageSendOptions extends MessageCreateOptions {
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export const isBotMentioned = (message: Message, clientId?: string): boolean => {
  if (!clientId || !message.content) return false;
  const mentionRegex = new RegExp(`<@!?${clientId}>`);
  return (
    mentionRegex.test(message.content) ||
    message.mentions.users.has(clientId) ||
    message.mentions.everyone
  );
};

export const safeSend = async (
  channel: TextChannel | DMChannel | NewsChannel | ThreadChannel,
  content: string | MessageCreateOptions,
  options?: MessageCreateOptions
): Promise<Message | null> => {
  const finalOptions: MessageCreateOptions =
    typeof content === "string" ? { content, ...options } : content;

  const {
    retry = true,
    retryAttempts = 3,
    retryDelay = 1000,
    ...messageOptions
  } = finalOptions as any;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await channel.send(messageOptions);
    } catch (err) {
      const isLast = attempt === retryAttempts;
      if (!retry || isLast) {
        logger.error(`Failed to send message in ${channel.id}`, {
          error: err,
          attempt,
        });
        return null;
      }
      await new Promise((r) => setTimeout(r, retryDelay * attempt));
      logger.warn(`Retrying send in ${channel.id}, attempt ${attempt + 1}`);
    }
  }
  return null;
};

export const replyEphemeral = async (
  interaction: Interaction,
  content: string | EmbedBuilder,
  components?: ActionRowBuilder<ButtonBuilder>[]
): Promise<Message | null> => {
  if (!interaction.isRepliable()) return null;

  const payload: InteractionReplyOptions = {
    flags: MessageFlags.Ephemeral,
    ...(components && { components }),
  };

  if (content instanceof EmbedBuilder) {
    payload.embeds = [content];
  } else {
    payload.content = content.slice(0, DISCORD_LIMITS.MESSAGE_CONTENT);
  }

  let msg: Message | null = null;
  if (interaction.replied || interaction.deferred) {
    msg = await interaction.followUp({ ...payload, fetchReply: true });
  } else {
    msg = await interaction.reply({ ...payload, fetchReply: true });
  }

  return msg;
};


export const replySafe = async (
  interaction: Interaction,
  content: string | EmbedBuilder,
  ephemeral = false,
  components?: ActionRowBuilder<ButtonBuilder>[]
): Promise<Message | null> => {
  if (!interaction.isRepliable()) return null;

  const payload: InteractionReplyOptions = {
    ...(components && { components }),
  };
  if (ephemeral) payload.flags = MessageFlags.Ephemeral;

  if (content instanceof EmbedBuilder) {
    payload.embeds = [content];
  } else {
    payload.content = content.slice(0, DISCORD_LIMITS.MESSAGE_CONTENT);
  }

  let msg: Message | null = null;
  if (interaction.replied || interaction.deferred) {
    msg = await interaction.followUp({ ...payload, fetchReply: true });
  } else {
    msg = await interaction.reply({ ...payload, fetchReply: true });
  }

  return msg;
};

export const chunkMessage = (
  content: string,
  maxLength = DISCORD_LIMITS.MESSAGE_CONTENT
): string[] => {
  if (content.length <= maxLength) return [content];
  const chunks: string[] = [];
  const lines = content.split("\n");
  let current = "";
  for (const line of lines) {
    const test = (current ? current + "\n" : "") + line;
    if (test.length > maxLength) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = test;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

export const waitForMessage = async (
  channel: TextChannel | DMChannel | NewsChannel,
  filter: (message: Message) => boolean,
  timeout = 30000
): Promise<Message | null> => {
  try {
    const collected = await channel.awaitMessages({
      filter,
      max: 1,
      time: timeout,
      errors: ["time"],
    });
    return collected.first() || null;
  } catch {
    return null;
  }
};
