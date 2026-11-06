import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  sessionDate: process.env.SESSION_DATE || "2026-11-30",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || "training_desk",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
};