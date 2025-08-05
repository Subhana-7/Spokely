import { Router } from "express";
import { TYPES } from "../types/types";
import container from "../config/inversify.config";
import { IMentorController } from "../controllers/interfaces/IMentorController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = container.get<IMentorController>(TYPES.IMentorController);

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.get("/all", authMiddleware(["mentor"]), controller.getAll);
router.post("/logout", controller.logout);
router.patch("/re-submit",controller.updateMentorDocument)
router.post("/refresh-token", controller.refreshToken);


export default router;
