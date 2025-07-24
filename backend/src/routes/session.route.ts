import express from "express";
import { SessionController } from "../controllers/session.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = new SessionController();

router.post("/schedule", authMiddleware(["user", "mentor"]), controller.createSession);
router.get("/list", authMiddleware(["user", "mentor"]), controller.getAllSessions);
router.get("/:id", authMiddleware(["user", "mentor"]), controller.getSessionById);
router.patch("/:id", authMiddleware(["user", "mentor"]), controller.updateSession);
router.get("/:id/token", authMiddleware(["user", "mentor"]), controller.getAgoraToken);

export default router;
