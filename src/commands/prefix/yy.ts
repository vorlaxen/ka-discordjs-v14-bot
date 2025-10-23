import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { BotCommand, ExtendedClient } from "../../types/clientTypes";

const yy: BotCommand = {
  name: "yy",
  description: "Yanlış kanalda yardım isteyenlere bilgilendirme mesajı gönderir.",
  settings: {
    mainGuildOnly: true
  },
  data: new SlashCommandBuilder()
    .setName("yy")
    .setDescription("Yanlış kanalda yardım isteyenlere bilgilendirme mesajı gönderir."),
  execute: async (interaction: CommandInteraction, client: ExtendedClient) => {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("💡 Doğru Kanal, Doğru Yardım")
      .setDescription(
        "Merhaba! Sorunu anlamak istiyorum ama önce birkaç önemli noktaya dikkat çekmek isterim:"
      )
      .addFields(
        {
          name: "📚 Akıllı Soru Sorma",
          value: "**[Don't Ask to Ask](https://dontasktoask.com/tr)** prensibini okumanı tavsiye ederim. " +
                 "Direkt sorununu detaylıca açıklaman, herkesin zamanından tasarruf ettirir.",
          inline: false
        },
        {
          name: "🎯 Doğru Kanalı Kullan",
          value: "Sunucumuzda konulara özel kanallar bulunuyor. Sorunu ilgili kanalda sormak:\n" +
                 "• Daha hızlı cevap almanı sağlar\n" +
                 "• Sohbet akışını korur\n" +
                 "• Aynı konuyu arayanların soruna ulaşmasını kolaylaştırır",
          inline: false
        },
        {
          name: "✨ İpucu",
          value: "Kanal listesine göz at ve soruna en uygun olanı seç. Emin değilsen moderatörlere sorabilirsin!",
          inline: false
        }
      )
      .setFooter({ 
        text: "Kod Atölyesi • Birlikte daha iyiyiz", 
        iconURL: client.user?.displayAvatarURL() 
      })
      .setTimestamp();

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  },
};

export default yy;