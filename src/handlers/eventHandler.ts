import { Events } from "discord.js";
import path from "path";
import { BotEvent, ExtendedClient } from "../types/clientTypes";
import logger from "../infrastructure/Logger";
import { getAllFiles } from "../utils/fileUtils";
import { importFile } from "../utils/importUtils";

export interface EventHandlerOptions {
  eventsDir?: string;
  enableHotReload?: boolean;
  eventPriority?: Map<string, number>;
  maxRetries?: number;
  retryDelay?: number;
}

export interface EventStats {
  totalLoaded: number;
  totalSkipped: number;
  totalFailed: number;
  loadTime: number;
  skippedFiles: string[];
  failedFiles: string[];
  eventsByType: Map<string, number>;
}

export class EventHandler {
  private readonly eventsDir: string;
  private readonly options: Required<EventHandlerOptions>;
  private loadedEvents = new Map<string, BotEvent<any[]>>();
  private eventListeners = new Map<string, (...args: any[]) => void>();
  private hotReloadWatcher?: any;
  private isLoading = false;

  constructor(
    private client: ExtendedClient,
    options: EventHandlerOptions = {}
  ) {
    this.eventsDir = options.eventsDir || path.resolve(process.cwd(), "src/events");
    this.options = {
      eventsDir: this.eventsDir,
      enableHotReload: false,
      eventPriority: new Map(),
      maxRetries: 3,
      retryDelay: 1000,
      ...options,
    };
  }

  public async loadAll(): Promise<EventStats> {
    if (this.isLoading) {
      logger.warn("Event loading already in progress, skipping...");
      return this.createEmptyStats();
    }

    this.isLoading = true;
    const startTime = Date.now();
    
    try {
      const eventFiles = await this.getEventFiles();
      const stats = await this.loadEventFiles(eventFiles);
      
      stats.loadTime = Date.now() - startTime;
      
      if (this.options.enableHotReload) {
        await this.setupHotReload();
      }
      
      //this.logLoadingResults(stats);
      return stats;
      
    } catch (err) {
      logger.error("Failed to load events directory", err);
      return this.createEmptyStats();
    } finally {
      this.isLoading = false;
    }
  }

  private async getEventFiles(): Promise<string[]> {
    try {
      const files = await getAllFiles(this.eventsDir);
      return files.filter(file => 
        file.endsWith('.js') || file.endsWith('.ts')
      );
    } catch (err) {
      logger.error(`Failed to read events directory: ${this.eventsDir}`, err);
      return [];
    }
  }

  private async loadEventFiles(eventFiles: string[]): Promise<EventStats> {
    const stats: EventStats = {
      totalLoaded: 0,
      totalSkipped: 0,
      totalFailed: 0,
      loadTime: 0,
      skippedFiles: [],
      failedFiles: [],
      eventsByType: new Map(),
    };

    // Sort files by priority if specified
    const sortedFiles = this.sortFilesByPriority(eventFiles);

    for (const file of sortedFiles) {
      const result = await this.loadSingleEvent(file);
      
      switch (result.status) {
        case 'loaded':
          stats.totalLoaded++;
          const eventType = result.event!.once ? 'once' : 'on';
          stats.eventsByType.set(eventType, (stats.eventsByType.get(eventType) || 0) + 1);
          break;
        case 'skipped':
          stats.totalSkipped++;
          stats.skippedFiles.push(file);
          break;
        case 'failed':
          stats.totalFailed++;
          stats.failedFiles.push(file);
          break;
      }
    }

    return stats;
  }

  private sortFilesByPriority(files: string[]): string[] {
    return files.sort((a, b) => {
      const priorityA = this.getFilePriority(a);
      const priorityB = this.getFilePriority(b);
      return priorityB - priorityA; // Higher priority first
    });
  }

  private getFilePriority(filePath: string): number {
    const fileName = path.basename(filePath, path.extname(filePath));
    return this.options.eventPriority.get(fileName) || 0;
  }

  private async loadSingleEvent(file: string, retryCount = 0): Promise<{
    status: 'loaded' | 'skipped' | 'failed';
    event?: BotEvent<any[]>;
    error?: Error;
  }> {
    try {
      // Clear require cache for hot reload
      if (this.options.enableHotReload && require.cache[file]) {
        delete require.cache[file];
      }

      const event = await importFile<BotEvent<any[]>>(file);

      if (!this.validateEvent(event, file)) {
        return { status: 'skipped' };
      }

      // Unregister previous event listener if exists
      this.unregisterEvent(event.name);

      const handler = this.createEventHandler(event, file);
      
      // Register event
      if (event.once) {
        this.client.once(event.name, handler);
      } else {
        this.client.on(event.name, handler);
      }

      this.loadedEvents.set(event.name, event);
      this.eventListeners.set(event.name, handler);
      this.client.events.set(event.name, event);

      logger.info(`Loaded event: ${event.name} (${event.once ? "once" : "on"}) from ${path.basename(file)}`);
      
      return { status: 'loaded', event };

    } catch (importErr) {
      const error = importErr as Error;
      logger.error(`Failed to import event file: ${file}`, error);

      // Retry logic
      if (retryCount < this.options.maxRetries) {
        logger.info(`Retrying to load ${file} (${retryCount + 1}/${this.options.maxRetries})`);
        await this.delay(this.options.retryDelay);
        return this.loadSingleEvent(file, retryCount + 1);
      }

      return { status: 'failed', error };
    }
  }

  private validateEvent(event: any, file: string): event is BotEvent<any[]> {
    if (!event) {
      logger.warn(`Event file exported nothing: ${file}`);
      return false;
    }

    if (typeof event.execute !== "function") {
      logger.warn(`Event missing execute function: ${file}`);
      return false;
    }

    if (!event.name || typeof event.name !== "string") {
      logger.warn(`Event missing or invalid name: ${file}`);
      return false;
    }

    // Validate Discord.js event name
    if (!this.isValidDiscordEvent(event.name)) {
      logger.warn(`Invalid Discord.js event name "${event.name}": ${file}`);
      return false;
    }

    return true;
  }

  private isValidDiscordEvent(eventName: string): boolean {
    // Check against known Discord.js events
    const validEvents = Object.values(Events);
    return validEvents.includes(eventName as any) || 
           typeof eventName === 'string' && eventName.length > 0;
  }

  private createEventHandler(event: BotEvent<any[]>, file: string) {
    return async (...args: any[]) => {
      try {
        const startTime = Date.now();
        await event.execute(...args, this.client);
        const executionTime = Date.now() - startTime;
        
        // Log slow events
        if (executionTime > 1000) {
          logger.warn(`Slow event execution: ${event.name} took ${executionTime}ms`);
        }
        
      } catch (err) {
        logger.error(`Error executing event "${event.name}" from file "${path.basename(file)}"`, err);
        
        // Emit error event for monitoring
        this.client.emit('eventError', {
          eventName: event.name,
          file,
          error: err,
          args
        });
      }
    };
  }

  private unregisterEvent(eventName: string): void {
    const existingHandler = this.eventListeners.get(eventName);
    if (existingHandler) {
      this.client.removeListener(eventName, existingHandler);
      this.eventListeners.delete(eventName);
      logger.debug(`Unregistered previous handler for: ${eventName}`);
    }
  }

  private async setupHotReload(): Promise<void> {
    try {
      const { watch } = await import('chokidar');
      
      this.hotReloadWatcher = watch(this.eventsDir, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
      });

      this.hotReloadWatcher
        .on('change', async (filePath) => {
          logger.info(`Event file changed: ${filePath}, reloading...`);
          await this.reloadSingleEvent(filePath);
        })
        .on('add', async (filePath) => {
          logger.info(`New event file added: ${filePath}, loading...`);
          await this.reloadSingleEvent(filePath);
        })
        .on('unlink', (filePath) => {
          logger.info(`Event file removed: ${filePath}, unregistering...`);
          this.unregisterEventByFile(filePath);
        });

      logger.info(`Hot reload enabled for: ${this.eventsDir}`);
    } catch (err) {
      logger.error("Failed to setup hot reload", err);
    }
  }

  private async reloadSingleEvent(filePath: string): Promise<void> {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.ts')) return;
    
    const result = await this.loadSingleEvent(filePath);
    if (result.status === 'loaded') {
      logger.info(`Successfully reloaded event from: ${path.basename(filePath)}`);
    }
  }

  private unregisterEventByFile(filePath: string): void {
    // Find and unregister event by file path (this is a simplified approach)
    for (const [eventName, event] of this.loadedEvents.entries()) {
      // This would need more sophisticated tracking to work properly
      this.unregisterEvent(eventName);
      this.loadedEvents.delete(eventName);
      this.client.events.delete(eventName);
    }
  }

  public async reload(): Promise<EventStats> {
    logger.info("Reloading all events...");
    
    // Clear existing events
    this.clearAllEvents();
    
    // Reload all events
    return await this.loadAll();
  }

  public clearAllEvents(): void {
    for (const [eventName, handler] of this.eventListeners.entries()) {
      this.client.removeListener(eventName, handler);
    }
    
    this.loadedEvents.clear();
    this.eventListeners.clear();
    this.client.events.clear();
    
    logger.info("Cleared all events");
  }

  public getLoadedEvents(): Map<string, BotEvent<any[]>> {
    return new Map(this.loadedEvents);
  }

  public isEventLoaded(eventName: string): boolean {
    return this.loadedEvents.has(eventName);
  }

  public getEventStats(): EventStats {
    const eventsByType = new Map<string, number>();
    
    for (const event of this.loadedEvents.values()) {
      const type = event.once ? 'once' : 'on';
      eventsByType.set(type, (eventsByType.get(type) || 0) + 1);
    }

    return {
      totalLoaded: this.loadedEvents.size,
      totalSkipped: 0,
      totalFailed: 0,
      loadTime: 0,
      skippedFiles: [],
      failedFiles: [],
      eventsByType
    };
  }

  public async destroy(): Promise<void> {
    if (this.hotReloadWatcher) {
      await this.hotReloadWatcher.close();
    }
    
    this.clearAllEvents();
    logger.info("EventHandler destroyed");
  }

  private createEmptyStats(): EventStats {
    return {
      totalLoaded: 0,
      totalSkipped: 0,
      totalFailed: 0,
      loadTime: 0,
      skippedFiles: [],
      failedFiles: [],
      eventsByType: new Map(),
    };
  }

  private logLoadingResults(stats: EventStats): void {
    logger.info(`📊 Event Loading Summary:`);
    logger.info(`   ✅ Loaded: ${stats.totalLoaded}`);
    logger.info(`   ⚠️  Skipped: ${stats.totalSkipped}`);
    logger.info(`   ❌ Failed: ${stats.totalFailed}`);
    logger.info(`   ⏱️  Load time: ${stats.loadTime}ms`);
    
    if (stats.eventsByType.size > 0) {
      logger.info(`   📋 Event types:`);
      for (const [type, count] of stats.eventsByType.entries()) {
        logger.info(`      ${type}: ${count}`);
      }
    }

    if (stats.skippedFiles.length > 0) {
      logger.warn(`   ⚠️  Skipped files: ${stats.skippedFiles.map(f => path.basename(f)).join(", ")}`);
    }
    
    if (stats.failedFiles.length > 0) {
      logger.error(`   ❌ Failed files: ${stats.failedFiles.map(f => path.basename(f)).join(", ")}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Kullanım örneği:
export function createEventHandler(client: ExtendedClient, options?: EventHandlerOptions): EventHandler {
  return new EventHandler(client, options);
}