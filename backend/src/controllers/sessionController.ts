import { asyncHandler } from "../utils/asyncHandler";
import { listSessions } from "../services/sessionService";

export const list = asyncHandler(async (_req, res) => res.json(await listSessions()));