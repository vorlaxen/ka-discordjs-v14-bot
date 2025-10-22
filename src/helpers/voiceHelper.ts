import {
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    entersState
} from "@discordjs/voice";
import { 
    Guild, 
    VoiceChannel, 
    GuildMember, 
    ChannelType 
} from "discord.js";
import logger from "../../services/logger";

type VoiceHelperOptions = {
    autoReconnect?: boolean;
    leaveOnEmpty?: boolean;
    reconnectDelay?: number;
};

class VoiceHelper {
    private guild?: Guild;
    private channel?: VoiceChannel;
    private connection: VoiceConnection | null = null;
    private options: VoiceHelperOptions;
    private reconnectTimeout?: NodeJS.Timeout;

    constructor(options?: VoiceHelperOptions) {
        this.options = {
            autoReconnect: true,
            leaveOnEmpty: true,
            reconnectDelay: 5000,
            ...options
        };
    }

    setGuild(guild: Guild): VoiceHelper {
        this.guild = guild;
        return this;
    }

    setChannel(channel: VoiceChannel): VoiceHelper {
        this.channel = channel;
        return this;
    }

    async join(): Promise<VoiceConnection | null> {
        if (!this.guild) throw new Error("Guild is not set.");

        let channel = this.channel;

        if (!channel) {
            channel = this.guild.channels.cache
                .find(ch => ch.type === ChannelType.GuildVoice) as VoiceChannel;
            
            if (channel) {
                logger.info(`No voice channel specified, using first available: ${channel.name} in guild: ${this.guild.name}`);
            }
        }

        if (!channel || channel.type !== ChannelType.GuildVoice) {
            logger.warn(`No voice channel found in guild: ${this.guild.name} (${this.guild.id})`);
            return null;
        }

        this.channel = channel;

        try {
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: this.guild.id,
                adapterCreator: this.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: false,
            });

            await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
            this.setupEventListeners();

            logger.info(`Bot joined voice channel: ${channel.name} (${channel.id}) in guild: ${this.guild.name}`);
            return this.connection;
        } catch (err) {
            logger.error(`Failed to join voice channel in guild ${this.guild.name}: ${(err as Error).message}`);
            this.connection?.destroy();
            this.connection = null;
            return null;
        }
    }

    private setupEventListeners(): void {
        if (!this.connection) return;

        if (this.options.autoReconnect) {
            this.connection.on("stateChange", (_, newState) => {
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    logger.warn(`Voice connection disconnected, attempting reconnect...`);
                    
                    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

                    this.reconnectTimeout = setTimeout(() => {
                        this.reconnect();
                    }, this.options.reconnectDelay);
                }
            });

            this.connection.on("error", (error) => {
                logger.error(`Voice connection error: ${error.message}`);
            });
        }

        if (this.options.leaveOnEmpty && this.channel) {
            this.checkChannelEmpty();
        }
    }

    private async reconnect(): Promise<void> {
        try {
            if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                this.connection.destroy();
            }
            await this.join();
        } catch (error) {
            logger.error(`Failed to reconnect: ${(error as Error).message}`);
        }
    }

    private checkChannelEmpty(): void {
        if (!this.channel) return;

        const humanMembers = this.channel.members.filter(member => !member.user.bot);
        
        if (humanMembers.size === 0) {
            logger.info(`Voice channel is empty, leaving...`);
            this.leave();
        }
    }

    leave(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }

        if (!this.connection) {
            logger.warn(`No active voice connection found.`);
            return;
        }

        this.connection.destroy();
        logger.info(`Bot left voice channel: ${this.channel?.name} (${this.channel?.id})`);
        this.connection = null;
    }

    async mute(mute: boolean = true): Promise<void> {
        const me = this.guild?.members.me;
        if (!me || !me.voice.channel) {
            logger.warn(`Bot is not in a voice channel: ${this.guild?.name} (${this.guild?.id})`);
            return;
        }

        try {
            await me.voice.setMute(mute);
            logger.info(`Bot has been ${mute ? "muted" : "unmuted"} in channel: ${me.voice.channel.name} (${me.voice.channel.id})`);
        } catch (error) {
            logger.error(`Failed to ${mute ? "mute" : "unmute"} bot: ${(error as Error).message}`);
        }
    }

    async deaf(deaf: boolean = true): Promise<void> {
        const me = this.guild?.members.me;
        if (!me || !me.voice.channel) {
            logger.warn(`Bot is not in a voice channel: ${this.guild?.name} (${this.guild?.id})`);
            return;
        }

        try {
            await me.voice.setDeaf(deaf);
            logger.info(`Bot has ${deaf ? "deafened" : "undeafened"} itself in channel: ${me.voice.channel.name} (${me.voice.channel.id})`);
        } catch (error) {
            logger.error(`Failed to ${deaf ? "deafen" : "undeafen"} bot: ${(error as Error).message}`);
        }
    }

    logUserCount(): void {
        if (!this.channel) {
            logger.warn("Voice channel not set.");
            return;
        }

        const totalUsers = this.channel.members.cache.size;
        const humanUsers = this.channel.members.cache.filter(m => !m.user.bot).size;
        const botUsers = this.channel.members.cache.filter(m => m.user.bot).size;

        logger.info(`Users in voice channel "${this.channel.name}": ${totalUsers} total (${humanUsers} humans, ${botUsers} bots)`);
    }

    getConnection(): VoiceConnection | null {
        return this.connection;
    }

    listUsers(): GuildMember[] {
        return this.channel ? Array.from(this.channel.members.cache.values()) : [];
    }

    listHumanUsers(): GuildMember[] {
        return this.channel ? 
            Array.from(this.channel.members.cache.filter(member => !member.user.bot).values()) : 
            [];
    }

    async joinAndMute(mute: boolean = true): Promise<VoiceHelper> {
        const connection = await this.join();
        if (connection) await this.mute(mute);
        return this;
    }

    async joinAndDeaf(deaf: boolean = true): Promise<VoiceHelper> {
        const connection = await this.join();
        if (connection) await this.deaf(deaf);
        return this;
    }

    async joinMutedAndDeafened(): Promise<VoiceHelper> {
        const connection = await this.join();
        if (connection) await Promise.all([this.mute(true), this.deaf(true)]);
        return this;
    }

    isConnected(): boolean {
        return this.connection !== null && 
               this.connection.state.status !== VoiceConnectionStatus.Destroyed &&
               this.connection.state.status !== VoiceConnectionStatus.Disconnected;
    }

    getChannelInfo(): { name: string; id: string; memberCount: number } | null {
        if (!this.channel) return null;
        return { name: this.channel.name, id: this.channel.id, memberCount: this.channel.members.cache.size };
    }

    destroy(): void {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.leave();
    }
}

export default VoiceHelper;
