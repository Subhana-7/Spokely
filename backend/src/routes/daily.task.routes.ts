import { Router } from "express";
import { DailyTaskController } from "../controllers/daily.task.controller";
import { IDailyTaskController } from "../controllers/interfaces/IDailyTaskController";
import container  from "../config/inversify.config";
import { TYPES } from "../types/types";

const controller = container.get<DailyTaskController>(TYPES.IDailyTaskController);
const router = Router();

router.post("/daily-task", controller.createDailyTask);
router.post("/daily-task/response", controller.addUserResponse);

export default router;
