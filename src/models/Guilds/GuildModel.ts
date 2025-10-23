import { Table, Column, Model, DataType, PrimaryKey, HasOne, Default } from "sequelize-typescript";
import { GuildSettingsModel } from "./GuildSettingsModel";

export enum GuildStatus {
    ACTIVE = 0,
    INACTIVE = 1,
    BANNED = 2
}

@Table({
    tableName: "guilds",
    timestamps: true,
})
export class GuildModel extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    id!: string;

    @Column({ type: DataType.STRING, allowNull: true })
    ownerId?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    preferredLocale?: string;

    @Default(GuildStatus.ACTIVE)
    @Column({ type: DataType.INTEGER })
    status!: GuildStatus;

    @HasOne(() => GuildSettingsModel, {
        foreignKey: "guildId",
        as: "settings",
        onDelete: "CASCADE",
    })
    settings!: GuildSettingsModel;
}
