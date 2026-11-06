import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// routes will be mounted here later
app.use("/api", routes);
app.use(errorHandler);
export default app;