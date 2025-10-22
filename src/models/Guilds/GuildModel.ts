import { Table, Column, Model, DataType, PrimaryKey, HasOne } from "sequelize-typescript";
import { GuildSettingsModel } from "./GuildSettingsModel";

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

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    isActive!: boolean;

    @HasOne(() => GuildSettingsModel, {
        foreignKey: "guildId",
        as: "settings",
        onDelete: "CASCADE",
    })
    settings!: GuildSettingsModel;
}
