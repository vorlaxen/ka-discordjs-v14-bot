import { Message, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotCommand, ExtendedClient } from "../../types/clientTypes";

const ping: BotCommand = {
  name: "ping",
  description: "Replies with Pong!",
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  execute: async (message: Message, client: ExtendedClient) => {
    await message.reply("Pong!");
  },
  executeSlash: async (interaction: CommandInteraction, client: ExtendedClient) => {
    await interaction.reply("Pong!");
  }
};

export default ping;
