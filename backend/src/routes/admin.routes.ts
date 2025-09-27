import express from "express";
import { IAdminController } from "../controllers/interfaces/IAdminController";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = container.get<IAdminController>(TYPES.IAdminController);

router.post("/login", controller.adminLogin.bind(controller));

router.get(
  "/users",
  authMiddleware(["admin"]),
  controller.listUsers.bind(controller)
);
router.get(
  "/mentors",
  authMiddleware(["admin"]),
  controller.listMentors.bind(controller)
);

router.get(
  "/home",
  authMiddleware(["admin"]),
  controller.home.bind(controller)
);

router.post(
  "/refresh-token",
  authMiddleware(["admin"]),
  controller.refreshToken.bind(controller)
);

router.patch("/users/:id/status", controller.updateUserStatus.bind(controller));

router.patch("/mentors/:id/status", controller.updateMentorStatus.bind(controller));

// router.delete("/users/:id", controller.deleteUser.bind(controller));

// router.patch("/mentors/:id/block", controller.blockUser.bind(controller)); // uncommment

// router.delete("/mentors/:id", controller.deleteUser.bind(controller));

router.get(
  "/mentors/verification/:id",
  controller.mentorVerification.bind(controller)
);

router.patch("/mentors/approve/:id", controller.approveMentor.bind(controller));

router.post("/mentors/reject/:id", controller.rejectMentor.bind(controller));

router.post('/logout',controller.logout.bind(controller));

router.get("/sessions",authMiddleware(["admin"]),controller.getAllSessionsAdmin.bind(controller))

export default router;
