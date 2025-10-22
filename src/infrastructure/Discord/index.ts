import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ClientOptions,
} from "discord.js";
import { ExtendedClient, BotCommand, BotEvent } from "../../types/clientTypes";
import logger from "../Logger";

const clientOptions: ClientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
};

const client = new Client(clientOptions) as ExtendedClient;

client.commands = new Collection<string, BotCommand>();
client.events = new Collection<string, BotEvent>();

client.on("error", (error: Error) => {
  logger.error({
    message: "Discord client error",
    error: error.message,
    stack: error.stack,
  });
});

client.on("shardError", (error: Error) => {
  logger.error({
    message: "Discord shard error",
    error: error.message,
    stack: error.stack,
  });
});

client.on("warn", (info: string) => {
  logger.warn(`Discord client warning: ${info}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error({
    message: "Unhandled Promise Rejection in Discord client",
    error: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on("uncaughtException", (error) => {
  logger.error({
    message: "Uncaught Exception in Discord client",
    error: error.message,
    stack: error.stack,
  });
});

export default client;
