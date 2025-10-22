import { GuildMember } from "discord.js";
import { BotEvent } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";

const memberRemove: BotEvent<[GuildMember]> = {
    name: "guildMemberRemove",
    once: false,
    execute: async (member): Promise<void> => {
        try {
            logger.info(`Member left: ${member.user.tag} from guild ${member.guild.name}`);

            const settings = await GuildSettingsModel.findByPk(member.guild.id);
            if (!settings || !settings.customSettings?.memberIncomingAndGoing) return;

            const memberSetting = settings.customSettings.memberIncomingAndGoing;

            if (memberSetting.enabled && memberSetting.channel) {
                const channel = member.guild.channels.cache.get(memberSetting.channel);
                if (channel?.isTextBased()) {
                    channel.send(`Goodbye ${member.user.tag}, we'll miss you!`);
                }
            }

        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error({
                message: "Error handling guildMemberRemove event",
                error: err.message,
                stack: err.stack,
            });
        }
    },
};

export default memberRemove;
