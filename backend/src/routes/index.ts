import { Router } from "express";
import * as enrollments from "../controllers/enrollmentController";
import * as sessions from "../controllers/sessionController";

const router = Router();

router.get("/sessions", sessions.list);

router.get("/enrollments", enrollments.list);
router.post("/enrollments", enrollments.create);
router.post("/enrollments/:id/cancel", enrollments.cancel);
router.post("/enrollments/:id/accept", enrollments.accept);
router.post("/enrollments/:id/decline", enrollments.decline);

export default router;