import { Client, Collection, type Interaction, type CommandInteraction, type SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, Message, ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface PrefixCommand {
  name: string;
  description?: string;
  execute: (message: Message, client: ExtendedClient, args: string[]) => Promise<Message | void>;
}

export interface SlashCommand {
  data: SlashCommandBuilder;
  settings?: any;
  execute: (interaction: CommandInteraction, client: ExtendedClient) => Promise<void>;
}

export interface BotCommand {
  name: string;
  description?: string;
  data?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  settings?: {
    cooldown?: number;
    ownerRequired?: boolean;
    adminRequired?: boolean;
    deleteTime?: number;
    disabled?: boolean;
    mainGuildOnly?: boolean;
    ignoreSilent?: boolean;
  }
  execute?: (target: Message, client: ExtendedClient, args?: string[]) => Promise<Message | null | void>;
  executeSlash?: (interaction: CommandInteraction, client: ExtendedClient) => Promise<void | null>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, BotCommand>;
  events: Collection<string, BotEvent>;
  registerCommand: (command: BotCommand) => void;
  handleInteraction: (interaction: Interaction) => Promise<void>;
}

export interface BotEvent<Args extends any[] = any[]> {
  name: string;
  once?: boolean;
  execute: (...args: [...Args, Client]) => Promise<void> | void;
}