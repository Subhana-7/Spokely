import express, { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { ISubscriptionController } from "../controllers/interfaces/ISubscriptionController";

const router = express.Router();
const controller = container.get<ISubscriptionController>(
  TYPES.ISubscriptionController
);

router.post(
  "/subscribe",
  authMiddleware(["user"]),
  controller.subscribe.bind(controller)
);
router.get(
  "/my-subscriptions/:id",
  authMiddleware(["user"]),
  controller.getUserSubscriptions.bind(controller)
);
router.get(
  "/mentor-students/:id",
  authMiddleware(["mentor"]),
  controller.getMentorSubscriptions.bind(controller)
);
router.patch(
  "/:id/cancel",
  authMiddleware(["user"]),
  controller.cancelSubscription.bind(controller)
);

router.get(
  "/mentor/:id/plans",
  authMiddleware(["mentor", "user"]),
  controller.getMentorPlans.bind(controller)
);
router.post(
  "/mentor/plans",
  authMiddleware(["mentor"]),
  controller.setMentorPlans.bind(controller)
);

export default router;
