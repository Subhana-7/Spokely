import { Router } from "express";
import {
  signup,
  login,
  sendOtp,
  verifyOtp,
  updateRole,
} from "../controllers/user.controller";
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }), //session false is temperory no auth for now
  (req, res) => {
    const user = req.user as any;

    const token = jwt.sign(
      { id: user._id, role: user.role, isGoogleUser: user.isGoogleUser },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/?token=${token}&showRole=true`);
  }
);

router.patch(
  '/update-role',
  authMiddleware(['user', 'mentor']),
  updateRole 
);

export default router;
