import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BotCommand, ExtendedClient } from "../../../types/clientTypes";
import {
  createAdvancedEmbed,
  EmbedColors,
  QuickEmbeds,
} from "../../../infrastructure/Discord/helper/embedHelper";
import { replyEphemeral, replySafe } from "../../../utils/bot/messageUtils";
import { botConfig } from "../../../config";

const UserInfo: BotCommand = {
  name: "user-info",
  data: new SlashCommandBuilder()
    .setName("user-info")
    .setDescription("Bir kullanıcının bilgilerini gösterir")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Bilgilerini görmek istediğiniz kullanıcı")
        .setRequired(false)
    ) as SlashCommandBuilder,
  settings: {
    cooldown: 10,
  },
  executeSlash: async (
    interaction: ChatInputCommandInteraction,
    client: ExtendedClient
  ): Promise<void> => {
    try {
      const targetUser =
        interaction.options.getUser("user") || interaction.user;
      const member = interaction.guild?.members.cache.get(targetUser.id);

      const avatarUrl = targetUser.displayAvatarURL({
        size: 1024,
        extension: targetUser.avatar?.startsWith("a_") ? "gif" : "png",
      });

      const embed = createAdvancedEmbed({
        title: `**Kullanıcı Bilgisi**`,
        color: EmbedColors.Primary,
        user: interaction.user,
        timestamp: true,
      })
        .setThumbnail(avatarUrl)
        .addFields([
          { name: "Kullanıcı", value: `${targetUser.tag}`, inline: true },
          { name: "ID", value: `${targetUser.id}`, inline: true },
          {
            name: "Sunucuya Katılma",
            value: member
              ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`
              : "Sunucuya katılmamış",
            inline: true,
          },
          {
            name: "Hesap Oluşturulma",
            value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Roller",
            value: member ? `${member.roles.cache.size - 1}` : "0",
            inline: true,
          },
          {
            name: "Avatar Linki",
            value: `[Tıkla](${avatarUrl})`,
            inline: true,
          },
        ])
        .setFooter({
          text: `${botConfig.appName} • Birlikte daha iyiyiz`,
          iconURL: client.user?.displayAvatarURL(),
        });

      await replySafe(interaction, embed);
    } catch (err) {
      const errorEmbed = QuickEmbeds.error(
        "Kullanıcı bilgilerini alırken bir hata oluştu.",
        interaction.user
      );
      await replyEphemeral(interaction, errorEmbed);
    }
  },
};

export default UserInfo;
