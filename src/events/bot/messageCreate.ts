import { Message } from "discord.js";
import { ExtendedClient } from "../../types/clientTypes";
import { botConfig } from "../../config";

const prefix = botConfig.prefix;

const messageCreate = {
  name: "messageCreate",
  once: false,
  execute: async (message: Message, client: ExtendedClient) => {
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift()?.toLowerCase();
    if (!cmdName) return;

    const command = client.commands.get(cmdName);
    if (!command) return;

    try {
      await command.execute(message, client);
    } catch (err) {
      console.error(`Error executing prefix command ${cmdName}:`, err);
    }
  }
};

export default messageCreate;
