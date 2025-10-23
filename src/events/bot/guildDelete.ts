import { Guild } from "discord.js";
import { BotEvent } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import { GuildModel, GuildStatus } from "../../models/Guilds/GuildModel";

const guildDelete: BotEvent<[Guild]> = {
    name: "guildDelete",
    once: false,
    execute: async (guild): Promise<void> => {
        try {
            logger.info(`Left guild: ${guild.name} (${guild.id})`);

            const existingGuild = await GuildModel.findByPk(guild.id);
            if (!existingGuild) {
                logger.warn(`Guild ${guild.name} (${guild.id}) not found in database.`);
                return;
            }

            await existingGuild.update({ status: GuildStatus.INACTIVE });

            logger.info(`Guild ${guild.name} (${guild.id}) marked as inactive in database.`);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error({
                message: "Error handling guildDelete event",
                error: err.message,
                stack: err.stack,
            });
        }
    },
};

export default guildDelete;
