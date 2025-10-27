import { mustParse } from "../utils/string";
const env = process.env;

export const botConfig = {
    // Core
    token: mustParse(env.BOT_TOKEN, "BOT_TOKEN", String),
    appId: mustParse(env.BOT_APP_ID, "BOT_APP_ID", String),
    mainServer: mustParse(env.BOT_MAIN_SERVER, "BOT_MAIN_SERVER", String),

    // Command & Prefix
    prefix: env.BOT_PREFIX || "!",
    ownerIds: env.BOT_OWNER_IDS?.split(",") || [],

    // Intents
    intents: ["Guilds", "GuildMessages", "MessageContent"] as const,

    // Logging
    logLevel: env.BOT_LOG_LEVEL || "info",
    errorChannelId: env.BOT_ERROR_CHANNEL || undefined,

    // Moderation
    modLogChannelId: env.BOT_MOD_LOG_CHANNEL || undefined,
    autoDeleteCommands: env.BOT_MOD_AUTO_DELETE === "true",

    appName: "CodeR7nge"
};