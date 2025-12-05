import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { IUserController } from "../controllers/interfaces/IUserController";

const router = express.Router();
const controller = container.get<IUserController>(TYPES.IUserController);

router.post("/signup", controller.signup.bind(controller));
router.post("/login", controller.login.bind(controller));
router.post("/send-otp", controller.sendOtp.bind(controller));
router.post("/verify-otp", controller.verifyOtp.bind(controller));

router.post(
  "/send-forgot-password-otp",
  controller.sendForgotPasswordOtp.bind(controller)
);
router.post(
  "/verify-forgot-password-otp",
  controller.verifyForgotPasswordOtp.bind(controller)
);
router.post("/reset-password", controller.resetPassword.bind(controller));

router.get("/home", authMiddleware(["user"]), controller.home.bind(controller));

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  controller.googleCallback.bind(controller)
);

router.post("/logout",authMiddleware(["user"]), controller.logout.bind(controller));
router.get(
  "/all",
  authMiddleware(["admin"]),
  controller.getAllUsers.bind(controller)
);

router.post("/refresh-token", authMiddleware(["user"]),controller.refreshToken.bind(controller));

router.get("/peer/profile/:id",authMiddleware(["user","mentor","admin"]), controller.profile.bind(controller));

router.post("/edit/:id",authMiddleware(["user"]), controller.editUser.bind(controller));

router.post("/change-password",authMiddleware(["user"]), controller.changePassword.bind(controller));

router.get("/mentor/listing",authMiddleware(["user"]), controller.mentorListing.bind(controller));

export default router;
