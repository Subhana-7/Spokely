import express from "express";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { ISessionController } from "../controllers/interfaces/ISessionController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = container.get<ISessionController>(TYPES.ISessionController);

router.post(
  "/schedule",
  authMiddleware(["user", "mentor"]),
  controller.createSession
);
router.get(
  "/list",
  authMiddleware(["user", "mentor"]),
  controller.getAllSessions
);
router.get(
  "/details/:id",
  authMiddleware(["user", "mentor"]),
  controller.getSessionById
);
router.patch(
  "/:id",
  authMiddleware(["user", "mentor"]),
  controller.updateSession
);

router.post(
  "/:id/respond",
  authMiddleware(["user", "mentor"]),
  controller.respondToInvite
);
router.post(
  "/:id/cancel-participation",
  authMiddleware(["user", "mentor"]),
  controller.cancelParticipation
);
router.post(
  "/:id/cancel-session",
  authMiddleware(["user", "mentor"]),
  controller.cancelSession
);
router.post(
  "/:id/flag",
  authMiddleware(["user", "mentor"]),
  controller.flagSession
);

router.get(
  "/:id/token",
  authMiddleware(["user", "mentor"]),
  controller.getAgoraToken
);
router.get("/public-sessions", controller.getPublicSessions);

router.post(
  "/:id/feedback",
  authMiddleware(["user", "mentor"]),
  controller.addFeedback
);

router.get(
  "/list-session",
  authMiddleware(["admin"]),
  controller.getAllSessionsAdmin
);
router.get(
  "/details/:id/admin",
  authMiddleware(["admin"]),
  controller.getSessionDetailsAdmin
);

export default router;
