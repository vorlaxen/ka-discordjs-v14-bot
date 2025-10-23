import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { GuildSettingsModel } from "../../../models/Guilds/GuildSettingsModel";
import { BotCommand, ExtendedClient } from "../../../types/clientTypes";
import { GuildModel, GuildStatus } from "../../../models/Guilds/GuildModel";
import { createAdvancedEmbed, EmbedColors, QuickEmbeds } from "../../../infrastructure/Discord/helper/embedHelper";
import { replyEphemeral, replySafe } from "../../../utils/bot/messageUtils";

const BotStats: BotCommand = {
    name: "bot-stats",
    data: new SlashCommandBuilder()
        .setName("bot-stats")
        .setDescription("Bot istatistiklerini getir"),
    settings: {
        cooldown: 180
    },
    execute: async (interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<any> => {
        try {
            const totalGuilds = await GuildModel.count();
            const activeGuilds = await GuildModel.count({ where: { isActive: true } });
            const inactiveGuilds = await GuildModel.count({ where: { isActive: false } });
            const bannedGuilds = await GuildModel.count({ where: { status: GuildStatus.BANNED } });

            const embed = createAdvancedEmbed({
                title: `**Bot İstatistikleri**`,
                color: EmbedColors.Primary,
                user: interaction.user,
                timestamp: true
            }).addFields([
                { name: "**Toplam Sunucu**", value: `${totalGuilds}`, inline: true },
                { name: "**Aktif Sunucu**", value: `${activeGuilds}`, inline: true },
                { name: "**Inaktif Sunucu**", value: `${inactiveGuilds}`, inline: true },
                { name: "**Banlanmış Sunucu**", value: `${bannedGuilds}`, inline: true },
            ]);

            await replySafe(interaction, embed);
        } catch (err) {
            const errorEmbed = QuickEmbeds.error("İstatistikleri alırken bir hata oluştu.", interaction.user);
            await replyEphemeral(interaction, errorEmbed);
        }
    },
};

export default BotStats;