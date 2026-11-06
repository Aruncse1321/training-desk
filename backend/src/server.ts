import app from "./app";
import { env } from "./config/env";
import { connectDB, sequelize } from "./config/database";
import "./models";
import { seedSessions } from "./seed/sessions";

async function start() {
  await connectDB();
  await sequelize.sync();
  await seedSessions();
  app.listen(env.port, () => console.log(`Server on http://localhost:${env.port}`));
}

start().catch((e) => {
  console.error("Failed to start", e);
  process.exit(1);
});