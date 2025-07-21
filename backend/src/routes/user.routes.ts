import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new UserController();

router.post("/signup", controller.signup);
router.post("/login", controller.login);

router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);

router.get("/home",controller.home);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err) {
        console.error("Google authentication error:", err);
        return res.redirect("http://localhost:5173?error=auth_failed");
      }
      
      if (!user) {
        return res.redirect("http://localhost:5173?error=no_user");
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, isGoogleUser: user.isGoogleUser },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.cookie("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });

      const isNewUser = user.createdAt.getTime() === user.updatedAt.getTime();
      const redirectUrl = isNewUser
        ? "http://localhost:5173/google-redirect?source=signup"
        : "http://localhost:5173/google-redirect";

      res.redirect(redirectUrl);
    })(req, res, next);
  }
);

// router.post("/logout", (req, res) => {
//   res.clearCookie("auth-token");
//   res.status(200).json({ message: "Logged out" });
// });

router.post("/logout", controller.logout);


router.patch("/update-role", authMiddleware(["user", "mentor"]), controller.updateRole);

router.get("/all", authMiddleware(["user", "mentor"]), controller.getAllUsers);


export default router;