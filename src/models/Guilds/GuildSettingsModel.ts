import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, Default } from "sequelize-typescript";
import { GuildModel } from "./GuildModel";

@Table({
  tableName: "guild_settings",
  timestamps: true,
})
export class GuildSettingsModel extends Model {
  @PrimaryKey
  @ForeignKey(() => GuildModel)
  @Column(DataType.STRING)
  guildId!: string;

  @Default("en")
  @Column(DataType.STRING)
  language!: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  customSettings?: Record<string, any>;

  @BelongsTo(() => GuildModel)
  guild!: GuildModel;
}
