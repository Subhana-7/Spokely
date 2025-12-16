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

router.patch("/users/:id/status",authMiddleware(["admin"]), controller.updateUserStatus.bind(controller));

router.patch(
  "/mentors/:id/status",authMiddleware(["admin"]),
  controller.updateMentorStatus.bind(controller)
);

router.get(
  "/mentors/verification/:id",authMiddleware(["admin"]),
  controller.mentorVerification.bind(controller)
);

router.patch("/mentors/approve/:id",authMiddleware(["admin"]), controller.approveMentor.bind(controller));

router.post("/mentors/reject/:id",authMiddleware(["admin"]), controller.rejectMentor.bind(controller));

router.post("/logout", authMiddleware(["admin"]),controller.logout.bind(controller));

router.get(
  "/sessions",
  authMiddleware(["admin"]),
  controller.getAllSessionsAdmin.bind(controller)
);

router.get("/payments",authMiddleware(["admin"]), controller.getAllPayments.bind(controller));
router.get("/payment/:id",authMiddleware(["admin"]),controller.getPaymentById.bind(controller));

router.get("/tasks",authMiddleware(["admin"]), controller.listAllDailyTasks.bind(controller));
router.get("/task/:id",authMiddleware(["admin"]),controller.getDailyTaskById.bind(controller));

router.get("/reports", controller.getReports.bind(controller));

router.get(
  "/reports/download/pdf",
  authMiddleware(["admin"]),
  controller.downloadReportPdf.bind(controller)
);


export default router;
