import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { IConnectionController } from "../controllers/interfaces/IConnectionsController";

const router = express.Router();
const controller = container.get<IConnectionController>(
  TYPES.IConnectionController
);

router.post(
  "/send",
  authMiddleware(["user", "mentor"]),
  controller.sendRequest.bind(controller)
);
router.get(
  "/requests",
  authMiddleware(["user", "mentor"]),
  controller.getRequests.bind(controller)
);
router.patch(
  "/accept",
  authMiddleware(["user", "mentor"]),
  controller.acceptConnection.bind(controller)
);
router.patch(
  "/reject",
  authMiddleware(["user", "mentor"]),
  controller.acceptConnection.bind(controller)
);
router.get(
  "/list",
  authMiddleware(["user", "mentor"]),
  controller.listConnections.bind(controller)
);
router.get(
  "/sent-requests",
  authMiddleware(["user", "mentor"]),
  controller.getSentRequests.bind(controller)
);

router.patch(
  "/:id/block",
  authMiddleware(["user", "mentor"]),
  controller.blockConnection.bind(controller)
);
router.patch(
  "/:id/unblock",
  authMiddleware(["user", "mentor"]),
  controller.unblockConnection.bind(controller)
);

router.delete(
  "/remove/:id",
  authMiddleware(["user"]),
  controller.removeConnection.bind(controller)
);

export default router;
