import { ActivityType } from "discord.js";
import { BotEvent, ExtendedClient } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import PresenceHelper from "../../utils/bot/presenceHelper";

const clientReady: BotEvent<[]> = {
    name: "ready",
    once: true,
    execute: async (client: ExtendedClient): Promise<void> => {
        try {
            if (!client.user) {
                logger.error("Client user is not available");
                return;
            }

            logger.info(`Discord client logged in as ${client.user.tag}`);

            const presenceHelper = new PresenceHelper(client);
            presenceHelper.setPresence({
                status: "online",
                activities: [
                    { name: "TypeScript writes", type: ActivityType.Playing, durationMs: 45000 },
                    { name: "Examining GitHub projects", type: ActivityType.Watching, durationMs: 45000 }
                ]
            });

        } catch (error) {
            logger.error({
                message: "Critical error in clientReady event",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }
}

export default clientReady;