import { Router } from "express";
import { IDailyTaskController } from "../controllers/interfaces/IDailyTaskController";
import express from "express"
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

const controller = container.get<IDailyTaskController>(
  TYPES.IDailyTaskController
);

router.post(
  "/daily-task",
  authMiddleware(["user"]),
  controller.createDailyTask.bind(controller)
);
router.post(
  "/daily-task/response",
  authMiddleware(["user"]),
  controller.addUserResponse.bind(controller)
);
router.post(
  "/submit-all",
  authMiddleware(["user"]),
  controller.submitAll.bind(controller)
);
router.get(
  "/user-latest",
  authMiddleware(["user"]),
  controller.getUserLatestTask.bind(controller)
);

export default router;
