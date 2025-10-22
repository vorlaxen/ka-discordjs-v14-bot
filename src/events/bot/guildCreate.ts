import { Guild } from "discord.js";
import { BotEvent } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import { GuildModel } from "../../models/Guilds/GuildModel";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";

const guildCreate: BotEvent<[Guild]> = {
    name: "guildCreate",
    once: false,
    execute: async (guild): Promise<void> => {
        try {
            logger.info(`Joined new guild: ${guild.name} (${guild.id})`);

            await GuildModel.upsert({
                id: guild.id,
                ownerId: guild.ownerId || null,
                preferredLocale: guild.preferredLocale || null,
                isActive: true,
            });

            await GuildSettingsModel.findOrCreate({
                where: { guildId: guild.id },
                defaults: { language: "en" },
            });

            logger.info(`Guild ${guild.name} (${guild.id}) successfully added/updated in database.`);

        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error({
                message: "Error handling guildCreate event",
                error: err.message,
                stack: err.stack,
            });
        }
    },
};

export default guildCreate;
