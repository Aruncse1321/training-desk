import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Session extends Model {
  declare id: number;
  declare name: string;
  declare room: string;
  declare capacity: number;
  declare price: number;
  declare startsAt: Date;
  declare endsAt: Date;
}

Session.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    room: { type: DataTypes.STRING(10), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "sessions" }
);