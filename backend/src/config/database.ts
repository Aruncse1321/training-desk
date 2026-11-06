import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",
  logging: false,
});

export async function connectDB() {
  await sequelize.authenticate();
  console.log("MySQL connected");
}