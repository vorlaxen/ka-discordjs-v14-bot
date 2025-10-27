import {
  Message,
  EmbedBuilder,
  ThreadChannel,
  NewsChannel,
  TextChannel,
} from "discord.js";
import { BotCommand, ExtendedClient } from "../../types/clientTypes";
import { botConfig } from "../../config";

const yyPrefix: BotCommand = {
  name: "yy",
  description:
    "Yanlış kanalda yardım isteyenlere bilgilendirme mesajı gönderir.",
  settings: {
    mainGuildOnly: true,
    deleteTime: 5000,
  },
  execute: async (
    message: Message,
    client: ExtendedClient,
    args?: string[]
  ): Promise<Message | void> => {
    if (!message.reference) {
      return;
    }

    const repliedMessage = await message.channel.messages.fetch(
      message.reference.messageId
    );

    if (!repliedMessage) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("💡 Doğru Kanal, Doğru Yardım")
      .setDescription(
        "Merhaba! Sorunu anlamak istiyorum ama önce birkaç önemli noktaya dikkat çekmek isterim:"
      )
      .addFields(
        {
          name: "📚 Akıllı Soru Sorma",
          value:
            "**[Don't Ask to Ask](https://dontasktoask.com/tr)** prensibini okumanı tavsiye ederim. " +
            "Direkt sorununu detaylıca açıklaman, herkesin zamanından tasarruf ettirir.",
          inline: false,
        },
        {
          name: "🎯 Doğru Kanalı Kullan",
          value:
            "Sunucumuzda konulara özel kanallar bulunuyor. Sorunu ilgili kanalda sormak:\n" +
            "• Daha hızlı cevap almanı sağlar\n" +
            "• Sohbet akışını korur\n" +
            "• Aynı konuyu arayanların soruna ulaşmasını kolaylaştırır",
          inline: false,
        },
        {
          name: "✨ İpucu",
          value:
            "Kanal listesine göz at ve soruna en uygun olanı seç. Emin değilsen moderatörlere sorabilirsin!",
          inline: false,
        }
      )
      .setFooter({
        text: `${botConfig.appName} • Birlikte daha iyiyiz`,
        iconURL: client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    if (message.channel.isTextBased() && "send" in message.channel) {
      const sentMessage = await (
        message.channel as TextChannel | NewsChannel | ThreadChannel
      ).send({
        content: `Hey ${repliedMessage.author}, dikkat!`,
        embeds: [embed],
      });

      return sentMessage;
    }
  },
};

export default yyPrefix;
