import { GuildMember } from "discord.js";
import { BotEvent } from "../../types/clientTypes";
import logger from "../../infrastructure/Logger";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";

const memberAdd: BotEvent<[GuildMember]> = {
    name: "guildMemberAdd",
    once: false,
    execute: async (member): Promise<void> => {
        try {
            logger.info(`New member joined: ${member.user.tag} in guild ${member.guild.name}`);

            let settings = await GuildSettingsModel.findByPk(member.guild.id);

            if (!settings) {
                settings = await GuildSettingsModel.create({
                    guildId: member.guild.id,
                    language: "en",
                    customSettings: {
                        memberIncomingAndGoing: { channel: '', enabled: false }
                    }
                });
            } else {
                const custom = settings.customSettings || {};
                if (!custom.memberIncomingAndGoing) {
                    custom.memberIncomingAndGoing = { channel: '', enabled: false };
                    settings.customSettings = custom;
                    await settings.save();
                }
            }

            const memberSetting = settings.customSettings.memberIncomingAndGoing;

            if (memberSetting.enabled && memberSetting.channel) {
                const channel = member.guild.channels.cache.get(memberSetting.channel);
                if (channel?.isTextBased()) {
                    channel.send(`Welcome ${member.user.tag} to the server!`);
                }
            }

        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error({
                message: "Error handling guildMemberAdd event",
                error: err.message,
                stack: err.stack,
            });
        }
    },
};

export default memberAdd;
