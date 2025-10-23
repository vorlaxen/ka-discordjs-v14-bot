import { GuildMember, TextChannel } from "discord.js";
import { ExtendedClient } from "../../types/clientTypes";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";
import { getAppEmoji } from "../../utils/bot/emojiUtils";
import { createAdvancedEmbed } from "../../infrastructure/Discord/helper/embedHelper";

const guildMemberRemove = {
  name: "guildMemberRemove",
  once: false,
  execute: async (member: GuildMember, client: ExtendedClient) => {
    if (member.user.bot) return;

    const guildId = member.guild.id;
    const settings = await GuildSettingsModel.findByPk(guildId);
    const config = settings?.customSettings?.memberIncomingAndGoing;

    if (!config?.enabled || !config.channel) return;

    const channel = member.guild.channels.cache.get(config.channel) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    const goodbyeMessages = [
      "Umarım tekrar görüşürüz! 👋",
      "Aramızdan ayrıldı, yolun açık olsun!",
      "Hoşçakal, seni özleyeceğiz!"
    ];

    const embed = createAdvancedEmbed({
      title: `**Bir Üye Ayrıldı!**`,
      description: [
        `**${member.user} aramızdan ayrıldı.**`,
        "",
        `**${goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]}**`
      ].join("\n"),
      type: "warning",
      thumbnail: { url: member.user.displayAvatarURL() },
      timestamp: true,
      footer: `${member.guild.name} • Şimdi ${member.guild.memberCount} üye kaldı.`,
    }).addFields([
      { name: "**Kullanıcı ID**", value: member.user.id, inline: false },
      { name: "**Ayrılma Tarihi**", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    ]);

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Error sending goodbye embed:", err);
    }
  }
};

export default guildMemberRemove;
