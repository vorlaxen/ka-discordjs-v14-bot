import { SlashCommandBuilder } from "discord.js";
import { BotCommand, ExtendedClient } from "../../types/clientTypes";
import { CommandInteraction } from "discord.js";
import { GuildSettingsModel } from "../../models/Guilds/GuildSettingsModel";

const setChannel: BotCommand = {
    name: "set-channel",
    description: "Set various bot channel settings and enable/disable them",
    data: new SlashCommandBuilder()
        .setName("set-channel")
        .setDescription("Set channel and enabled for different bot features")
        .addStringOption(option =>
            option.setName("option")
                .setDescription("Which option to configure")
                .setRequired(true)
                .addChoices(
                    { name: "Member Incoming/Going", value: "memberIncomingAndGoing" },
                    { name: "Member Count", value: "memberCount" }
                ))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to set (optional)"))
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable (optional)")),
    executeSlash: async (interaction: CommandInteraction, client: ExtendedClient) => {
        if (!interaction.isChatInputCommand()) return;

        const guildId = interaction.guildId;
        if (!guildId) return;

        const option = interaction.options.getString("option", true);
        const channel = interaction.options.getChannel("channel");
        const enabled = interaction.options.getBoolean("enabled");

        let settings = await GuildSettingsModel.findByPk(guildId);
        if (!settings) {
            settings = await GuildSettingsModel.create({
                guildId,
                customSettings: {}
            });
        }

        const currentConfig = settings.customSettings || {};
        const updatedOption = {
            channel: channel?.id ?? currentConfig[option]?.channel ?? "",
            enabled: enabled ?? currentConfig[option]?.enabled ?? false
        };

        currentConfig[option] = updatedOption;

        await GuildSettingsModel.update(
            { customSettings: currentConfig },
            { where: { guildId } }
        );

        await interaction.reply({
            content: [
                `**Option:** \`${option}\``,
                `**Channel:** ${updatedOption.channel ? `<#${updatedOption.channel}>` : "Not set"}`,
                `**Enabled:** ${updatedOption.enabled}`
            ].join("\n"),
            flags: 1 << 6
        });
    }
};

export default setChannel;
