import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";
import { ExtendedClient, BotCommand } from "../types/clientTypes";
import { botConfig } from "../config";
import logger from "../infrastructure/Logger";

export interface CommandHandlerOptions {
  commandsDir?: string;
  enableHotReload?: boolean;
  testGuildId?: string;
}

export class CommandHandler {
  private commandsDir: string;
  private hotReloadWatcher?: any;

  constructor(private client: ExtendedClient, options: CommandHandlerOptions = {}) {
    this.commandsDir = options.commandsDir
      ? path.resolve(process.cwd(), options.commandsDir)
      : path.resolve(process.cwd(), "src/commands");
  }

  /** Tüm komutları yükler (prefix + slash + all) */
  public loadAll(): void {
    const categories = ["prefix", "slash", "all"];
    for (const cat of categories) {
      const catPath = path.join(this.commandsDir, cat);
      if (!fs.existsSync(catPath)) continue;

      const files = fs.readdirSync(catPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
      for (const file of files) {
        // import yerine dynamic import kullanmak daha güvenli
        const fullPath = path.join(catPath, file);
        let imported: any;
        try {
          imported = require(fullPath);
        } catch (err) {
          logger.error(`Failed to import command file: ${fullPath}`, err);
          continue;
        }

        const command: BotCommand = imported?.default;
        if (!command) continue;

        // Slash komut
        if ("data" in command && command.data?.name && typeof command.data.name === "string") {
          this.client.commands.set(command.data.name, command);
          logger.info(`Loaded slash command: ${command.data.name}`);
        }
        // Prefix komut
        else if ("name" in command && typeof command.name === "string") {
          this.client.commands.set(command.name, command);
          logger.info(`Loaded prefix command: ${command.name}`);
        }
      }
    }

    logger.info(`All loaded commands: ${Array.from(this.client.commands.keys()).length}`);
  }

  /** Slash komutlarını Discord API'ye kaydeder */
  public async registerSlashCommands(guildId?: string): Promise<void> {
    const slashCommands = Array.from(this.client.commands.values())
      .filter(cmd => "data" in cmd)
      .map(cmd => (cmd as BotCommand).data.toJSON());

    const rest = new REST({ version: "10" }).setToken(botConfig.token!);

    try {
      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(botConfig.appId!, guildId), { body: slashCommands });
        logger.info(`Slash commands registered for guild ${guildId}. Total: ${slashCommands.length}`);
      } else {
        await rest.put(Routes.applicationCommands(botConfig.appId!), { body: slashCommands });
        logger.info(`Global slash commands registered. Total: ${slashCommands.length}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({
        message: "Error registering slash commands",
        error: error.message,
        stack: error.stack
      });
    }
  }
}
