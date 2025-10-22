import { CommandInteraction } from "discord.js";
import { ExtendedClient } from "../../types/clientTypes";

export default {
    name: "interactionCreate",
    once: false,
    execute: async (interaction: CommandInteraction, client: ExtendedClient) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.executeSlash) {
            await command.executeSlash(interaction, client);
        } else {
            console.warn(`Slash command ${interaction.commandName} has no executeSlash handler.`);
        }
    }
};
