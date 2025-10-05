import express from "express";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { IChatController } from "../controllers/interfaces/IChatController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = container.get<IChatController>(TYPES.IChatController);

router.get(
  "/messages/:sessionId",
  authMiddleware(["user", "mentor"]),
  controller.getMessages.bind(controller)
);

router.post(
  "/messages/:sessionId",
  authMiddleware(["user", "mentor"]),
  controller.sendMessage.bind(controller)
);


router.get("/all", authMiddleware(["user","mentor"]),controller.getChats.bind(controller));

export default router;
