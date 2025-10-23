import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel, Message } from "discord.js";
import { BotCommand, ExtendedClient } from "../../../types/clientTypes";
import { createAdvancedEmbed, EmbedColors, QuickEmbeds } from "../../../infrastructure/Discord/helper/embedHelper";
import { replyEphemeral, replySafe } from "../../../utils/bot/messageUtils";

async function fetchMessages(channel: TextChannel, limit: number, userId?: string) {
    const messages = await channel.messages.fetch({ limit });
    if (userId) return messages.filter(msg => msg.author.id === userId);
    return messages;
}

async function deleteMessages(channel: TextChannel, messages: Map<string, Message>) {
    const deletable = Array.from(messages.values()).filter(
        msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
    );
    return await channel.bulkDelete(deletable, true);
}

const clear: BotCommand = {
    name: "clear",
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Mesajları temizler")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt => opt
            .setName("amount")
            .setDescription("Kaç mesaj silinecek (1-100)")
            .setRequired(true))
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("Sadece bu kullanıcının mesajlarını sil"))
        .addChannelOption(opt => opt
            .setName("channel")
            .setDescription("Mesajları temizlemek istediğiniz kanal")
            .addChannelTypes(0) // 0 = GuildText
        ) as any,
    settings: {
        cooldown: 20,
        adminRequired: true,
        disabled: false,
        ignoreSilent: true
    },
    async executeSlash(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
        if (!interaction.guild) {
            return replyEphemeral(interaction, QuickEmbeds.error("Bu komut sadece sunucularda çalışır.", interaction.user));
        }

        const channelOption: TextChannel = interaction.options.getChannel("channel");
        const channel = (channelOption?.isTextBased() ? channelOption : interaction.channel) as TextChannel;

        const amount = Math.min(interaction.options.getInteger("amount", true), 100);
        const user = interaction.options.getUser("user");

        if (!channel || !channel.isTextBased()) {
            return replyEphemeral(interaction, QuickEmbeds.error("Geçerli bir kanal seçilmedi.", interaction.user));
        }

        try {
            const messages = await fetchMessages(channel, amount, user?.id);
            if (!messages.size) {
                return replyEphemeral(interaction, QuickEmbeds.error("Silinecek mesaj bulunamadı.", interaction.user));
            }

            const deleted = await deleteMessages(channel, messages);

            const embed = createAdvancedEmbed({
                title: "🧹 **Mesaj Temizlendi**",
                color: EmbedColors.Primary,
                user: interaction.user,
                timestamp: true
            }).addFields([
                { name: user ? "**Kullanıcı**" : "**Toplam**", value: user ? `${user.tag}` : "Tüm kullanıcılar", inline: true },
                { name: "**Silinen Mesaj Sayısı**", value: `${deleted?.size ?? 0}`, inline: true },
                { name: "**Kanal**", value: `${channel.name}`, inline: true }
            ]);

            await replySafe(interaction, embed);
        } catch (err) {
            console.error("Clear komut hatası:", err);
            await replyEphemeral(interaction, QuickEmbeds.error("Mesajlar temizlenirken bir hata oluştu.", interaction.user));
        }
    }
};

export default clear;
