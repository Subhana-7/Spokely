import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { INotificationController } from "../controllers/interfaces/INotificationController";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";

const router = express.Router();
const controller = container.get<INotificationController>(
  TYPES.INotificationController
);

router.get("/:userId",authMiddleware(["mentor","user"]), controller.getUserNotifications.bind(controller));
router.patch("/:id/read",authMiddleware(["mentor","user"]), controller.markAsRead.bind(controller));

export default router;
