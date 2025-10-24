import { Router } from "express";
import { DailyTaskController } from "../controllers/daily.task.controller";
import { IDailyTaskController } from "../controllers/interfaces/IDailyTaskController";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { authMiddleware } from "../middleware/auth.middleware";

const controller = container.get<DailyTaskController>(
  TYPES.IDailyTaskController
);
const router = Router();

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
