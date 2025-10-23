import { CommandInteraction, Interaction } from "discord.js";
import { ExtendedClient } from "../../types/clientTypes";
import { botConfig } from "../../config";
import logger from "../../infrastructure/Logger";

export default {
  name: "interactionCreate",
  once: false,
  execute: async (interaction: Interaction, client: ExtendedClient) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.settings?.disabled) {
      await interaction.reply({
        content: "Bu komut şu anda devre dışı.",
        ephemeral: true
      });
      return;
    }

    if (command.settings.mainGuildOnly && interaction.guildId !== botConfig.mainServer) {
      await interaction.reply({
        content: "Bu komut yalnızca ana sunucuda kullanılabilir.",
        ephemeral: true
      });
      return;
    }

    try {
      if (command.executeSlash) {
        await command.executeSlash(interaction, client);
      } else if (command.execute) {
        await command.execute(interaction, client);
      } else {
        logger.warn(`Slash command ${interaction.commandName} has no executeSlash or execute handler.`);
        await interaction.reply({
          content: "Bu komut doğru yapılandırılmamış.",
          ephemeral: true
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        message: `Error executing command: ${interaction.commandName}`,
        error: error.message,
        stack: error.stack
      });

      if (!interaction.replied) {
        await interaction.reply({
          content: "Komut çalıştırılırken bir hata oluştu.",
          ephemeral: true
        });
      }
    }
  }
};
