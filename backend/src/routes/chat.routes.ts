import express from "express";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { IChatController } from "../controllers/interfaces/IChatController";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = container.get<IChatController>(TYPES.IChatController);

router.get("/:sessionId", authMiddleware(["user", "mentor"]), controller.getMessages);

router.post(
  "/:sessionId",
  authMiddleware(["user", "mentor"]),
  controller.sendMessage
);

export default router;
