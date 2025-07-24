import express from "express";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { ISessionController } from "../controllers/interfaces/ISessionController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = container.get<ISessionController>(TYPES.ISessionController);

router.post("/schedule", authMiddleware(["user", "mentor"]), controller.createSession);
router.get("/list", authMiddleware(["user", "mentor"]), controller.getAllSessions);
router.get("/:id", authMiddleware(["user", "mentor"]), controller.getSessionById);
router.patch("/:id", authMiddleware(["user", "mentor"]), controller.updateSession);
router.get("/:id/token", authMiddleware(["user", "mentor"]), controller.getAgoraToken);

export default router;
