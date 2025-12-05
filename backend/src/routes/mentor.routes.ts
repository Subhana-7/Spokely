import { Router } from "express";
import { TYPES } from "../types/types";
import container from "../config/inversify.config";
import { IMentorController } from "../controllers/interfaces/IMentorController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = container.get<IMentorController>(TYPES.IMentorController);

router.post("/signup", controller.signup.bind(controller));
router.post("/login", controller.login.bind(controller));
router.post("/send-otp", controller.sendOtp.bind(controller));
router.post("/verify-otp", controller.verifyOtp.bind(controller));

router.get(
  "/all",
  authMiddleware(["mentor"]),
  controller.getAll.bind(controller)
);

router.post("/logout",authMiddleware(["mentor"]), controller.logout.bind(controller));
router.patch("/re-submit", controller.updateMentorDocument.bind(controller));
router.post("/refresh-token",authMiddleware(["mentor"]), controller.refreshToken.bind(controller));

router.post("/forgot-password", controller.forgotPassword.bind(controller));
router.post(
  "/verify-forgot-password",
  controller.verifyForgotPassword.bind(controller)
);

router.post(
  "/home",
  authMiddleware(["mentor"]),
  controller.home.bind(controller)
);

router.get("/mentor-profile/:id",authMiddleware(["mentor","user","admin"]), controller.profile.bind(controller));

router.post(
  "/edit/:id",
  authMiddleware(["mentor"]),
  controller.editMentor.bind(controller)
);

router.post(
  "/change-password",
  authMiddleware(["mentor"]),
  controller.changePassword.bind(controller)
);

export default router;
