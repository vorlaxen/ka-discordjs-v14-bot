import { GuildMember, TextChannel } from "discord.js";
import { ExtendedClient } from "../../types/clientTypes";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";
import { getAppEmoji } from "../../utils/bot/emojiUtils";
import { createAdvancedEmbed } from "../../helpers/embedHelper";

const guildMemberAdd = {
  name: "guildMemberAdd",
  once: false,
  execute: async (member: GuildMember, client: ExtendedClient) => {
    if (member.user.bot) return;

    const guildId = member.guild.id;
    const settings = await GuildSettingsModel.findByPk(guildId);
    const config = settings?.customSettings?.memberIncomingAndGoing;

    if (!config?.enabled || !config.channel) return;

    const channel = member.guild.channels.cache.get(config.channel) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    const welcomeMessages = [
      "Umarım keyifli vakit geçirirsin!",
      "Hoş geldin, seni görmek harika!",
      "Aramıza katıldığın için çok mutluyuz!"
    ];

    const embed = createAdvancedEmbed({
      title: `**Yeni Üye Katıldı!**`,
      description: [
        `**Aramıza hoş geldin** ${member.user}!`,
        "",
        `**${welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}**`
      ].join("\n"),
      type: "info",
      thumbnail: { url: member.user.displayAvatarURL() },
      timestamp: true,
      footer: `${member.guild.name} • Şu an ${member.guild.memberCount} üye var!`,
    }).addFields([
      { name: "**Kullanıcı ID**", value: member.user.id, inline: false },
      { name: "**Katılım Tarihi**", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    ]);

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Error sending welcome embed:", err);
    }
  }
};

export default guildMemberAdd;
