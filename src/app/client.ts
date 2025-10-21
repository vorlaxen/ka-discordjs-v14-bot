import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { ExtendedClient, BotCommand, BotEvent } from "../types/clientTypes";
import logger from "../infrastructure/Logger";

const client: ExtendedClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}) as ExtendedClient;

client.commands = new Collection<string, BotCommand>();
client.events = new Collection<string, BotEvent>();

client.on("error", (error) => logger.error("Client Error:", error));
client.on("shardError", (error) => logger.error("Shard Error:", error));
client.on("warn", (info) => logger.warn("Client Warning:", info));

export default client;
