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

router.get("/home", authMiddleware(["user"]), (req, res) => {
  res.json({ message: "Welcome Home!" });
});

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
    console.log("GOOGLE CALLBACK JWT_SECRET:", process.env.JWT_SECRET);
    const user = req.user as any;

    const token = jwt.sign(
      { id: user._id, role: user.role, isGoogleUser: user.isGoogleUser },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    console.log(token)

    const isNewUser = user.createdAt.getTime() === user.updatedAt.getTime();

    const redirectUrl = `http://localhost:5173/google-redirect?token=${token}${
      isNewUser ? "&source=signup" : ""
    }`;

    res.redirect(redirectUrl);
  }
);

router.patch("/update-role", authMiddleware(["user", "mentor"]), updateRole);

export default router;
