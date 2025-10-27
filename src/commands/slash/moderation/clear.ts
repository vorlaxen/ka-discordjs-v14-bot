import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    TextChannel,
    Message,
} from "discord.js";
import { BotCommand, ExtendedClient } from "../../../types/clientTypes";
import {
    createAdvancedEmbed,
    EmbedColors,
    QuickEmbeds,
} from "../../../infrastructure/Discord/helper/embedHelper";
import { replyEphemeral, replySafe } from "../../../utils/bot/messageUtils";
import { botConfig } from "../../../config";

async function fetchMessages(
    channel: TextChannel,
    limit: number,
    userId?: string
) {
    // Discord API fetch limit maksimum 100, ama bizde işlem yapılacak miktar kadar alıyoruz
    const messages = await channel.messages.fetch({ limit });
    if (userId) return messages.filter((msg) => msg.author.id === userId);
    return messages;
}

async function deleteMessages(
    channel: TextChannel,
    messages: Map<string, Message>
) {
    const deletable = Array.from(messages.values()).filter(
        (msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
    );

    // 100 mesajlık chunk'lara böl ve sırayla sil
    const chunks: Message[][] = [];
    for (let i = 0; i < deletable.length; i += 100) {
        chunks.push(deletable.slice(i, i + 100));
    }

    let deletedCount = 0;
    for (const chunk of chunks) {
        const deleted = await channel.bulkDelete(chunk, true);
        deletedCount += deleted.size;
    }

    return deletedCount;
}

const clear: BotCommand = {
    name: "clear",
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Mesajları temizler")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((opt) =>
            opt
                .setName("amount")
                .setDescription("Kaç mesaj silinecek (1-100)")
                .setRequired(true)
        )
        .addUserOption((opt) =>
            opt
                .setName("user")
                .setDescription("Sadece bu kullanıcının mesajlarını sil")
        )
        .addChannelOption((opt) =>
            opt
                .setName("channel")
                .setDescription("Mesajları temizlemek istediğiniz kanal")
                .addChannelTypes(0) // 0 = GuildText
        ) as any,
    settings: {
        cooldown: 20,
        adminRequired: true,
        deleteTime: 3000,
        disabled: false,
        ignoreSilent: true,
    },
    async executeSlash(
        interaction: ChatInputCommandInteraction,
        client: ExtendedClient
    ): Promise<any> {
        if (!interaction.guild) {
            return replyEphemeral(
                interaction,
                QuickEmbeds.error(
                    "Bu komut sadece sunucularda çalışır.",
                    interaction.user
                )
            );
        }

        await interaction.deferReply({ ephemeral: true });

        const channelOption: TextChannel =
            interaction.options.getChannel("channel");
        const channel = (
            channelOption?.isTextBased() ? channelOption : interaction.channel
        ) as TextChannel;

        const amount = Math.min(
            interaction.options.getInteger("amount", true),
            100
        );
        const user = interaction.options.getUser("user");

        if (!channel || !channel.isTextBased()) {
            return replyEphemeral(
                interaction,
                QuickEmbeds.error("Geçerli bir kanal seçilmedi.", interaction.user)
            );
        }

        try {
            const messages = await fetchMessages(channel, amount, user?.id);
            if (!messages.size) {
                return replyEphemeral(
                    interaction,
                    QuickEmbeds.error("Silinecek mesaj bulunamadı.", interaction.user)
                );
            }

            const deletedCount = await deleteMessages(channel, messages);

            const embed = createAdvancedEmbed({
                title: "🧹 **Mesaj Temizlendi**",
                color: EmbedColors.Primary,
                user: interaction.user,
                timestamp: true,
            }).addFields([
                {
                    name: user ? "**Kullanıcı**" : "**Toplam**",
                    value: user ? `${user.tag}` : "Tüm kullanıcılar",
                    inline: true,
                },
                {
                    name: "**Silinen Mesaj Sayısı**",
                    value: `${deletedCount}`,
                    inline: true,
                },
                { name: "**Kanal**", value: `${channel.name}`, inline: true },
            ]).setFooter({
                text: `${botConfig.appName} • Birlikte daha iyiyiz`,
                iconURL: client.user?.displayAvatarURL(),
            });

            const feedbackMsg = await replySafe(interaction, embed);
            return feedbackMsg;
        } catch (err) {
            console.error("Clear komut hatası:", err);
            return await replyEphemeral(
                interaction,
                QuickEmbeds.error(
                    "Mesajlar temizlenirken bir hata oluştu.",
                    interaction.user
                )
            );
        }
    }
};

export default clear;
