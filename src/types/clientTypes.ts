import { Client, Collection, type Interaction, type CommandInteraction, type SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface BotCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  settings: {
    cooldown?: number;
    ownerRequired?: boolean;
    adminRequired?: boolean;
    disabled?: boolean;
    ignoreSilent?: boolean;
  }
  execute: (interaction: CommandInteraction, client: ExtendedClient) => Promise<void>;
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