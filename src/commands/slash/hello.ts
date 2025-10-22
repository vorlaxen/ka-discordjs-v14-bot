import { SlashCommandBuilder } from "discord.js";
import { SlashCommand, ExtendedClient } from "../../types/clientTypes";

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Replies with a greeting!"),
    execute: async (interaction, client: ExtendedClient) => {
        if (!interaction.isChatInputCommand()) return;
        await interaction.reply(`Hello, ${interaction.user.username}!`);
    }
};

export default command;