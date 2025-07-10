import express from "express";
import { SessionController } from "../controllers/session.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/schedule", authMiddleware(["user", "mentor"]), SessionController.createSession);
router.get("/list", authMiddleware(["user", "mentor"]), SessionController.getAllSessions);
router.get("/:id", authMiddleware(["user", "mentor"]), SessionController.getSessionById);
router.patch("/:id", authMiddleware(["user", "mentor"]), SessionController.updateSession);

export default router;
