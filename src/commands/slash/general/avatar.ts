import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BotCommand, ExtendedClient } from "../../../types/clientTypes";
import { createAdvancedEmbed, EmbedColors, QuickEmbeds } from "../../../infrastructure/Discord/helper/embedHelper";
import { replyEphemeral, replySafe } from "../../../utils/bot/messageUtils";

const UserAvatar: BotCommand = {
    name: "avatar",
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Birinin profil fotoğrafını gösterir")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Avatarını görmek istediğiniz kullanıcı")
                .setRequired(false)
        ) as SlashCommandBuilder,
    settings: {
        cooldown: 10
    },
    async executeSlash(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
        try {
            const targetUser = interaction.options.getUser("user") || interaction.user;

            const avatarUrl = targetUser.displayAvatarURL({
                size: 1024,
                extension: targetUser.avatar?.startsWith("a_") ? "gif" : "png",
            });

            const embed = createAdvancedEmbed({
                title: `**Kullanıcı Avatarı**`,
                color: EmbedColors.Primary,
                user: interaction.user,
                timestamp: true
            }).setImage(avatarUrl)
              .addFields([
                { name: "Kullanıcı", value: `${targetUser.tag}`, inline: true },
                { name: "Avatar Linki", value: `[Tıkla](${avatarUrl})`, inline: true }
              ]);

            await replySafe(interaction, embed);
        } catch (err) {
            const errorEmbed = QuickEmbeds.error("Birinin profil fotoğrafını alırken sorun oluştu.", interaction.user);
            await replyEphemeral(interaction, errorEmbed);
        }
    },
};

export default UserAvatar;
