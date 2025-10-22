import { ActivityType, ClientPresenceStatus } from "discord.js";
import { BotEvent, ExtendedClient } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import PresenceHelper from "../../utils/bot/presenceHelper";

const ACTIVITIES = [
    { name: "TypeScript writes", type: ActivityType.Playing, durationMs: 45_000 },
    { name: "Examining GitHub projects", type: ActivityType.Watching, durationMs: 45_000 },
] as const;

const clientReady: BotEvent<[]> = {
    name: "clientReady",
    once: true,
    execute: async (client: ExtendedClient): Promise<void> => {
        if (!client.user) {
            logger.error("Client user is not available. Login failed or client not ready.");
            return;
        }

        logger.info(`Discord client logged in as ${client.user.tag}`);

        try {
            if (!client.isReady()) {
                logger.warn("Client is not fully ready yet. Delaying presence initialization...");
                await new Promise((r) => setTimeout(r, 2000));
            }

            const presenceHelper = new PresenceHelper(client);
            presenceHelper.setPresence({
                status: "online" satisfies ClientPresenceStatus,
                activities: ACTIVITIES.map(a => ({ ...a }))
            });

            logger.info("Presence rotation initialized successfully.");
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error({
                message: "Critical error in clientReady event",
                error: err.message,
                stack: err.stack
            });
        }
    }
};

export default clientReady;
