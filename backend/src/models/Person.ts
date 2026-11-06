import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Person extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare company: string;
}

Person.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    company: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "people" }
);