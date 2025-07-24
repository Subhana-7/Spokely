import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { error } from "console";
import jwt from "jsonwebtoken";
import passport from "passport";
import { IUserController } from "./interfaces/IUserController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserService } from "../services/interfaces/IUserService";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.IUserService) private service: IUserService) {}

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.signup(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);

      if (!result) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const { user, token } = result;

      res.cookie("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });

      res.status(200).json({ user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(200).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;
      const result = await this.service.verifyOtp(email, code);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  handleGoogleAccounts = async(
    req: Request,
    res: Response,
    next: Function
  ): Promise<void> => {
    try {
      passport.authenticate("google", { scope: ["profile", "email"] })(
        req,
        res,
        next
      );
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  googleCallback = async(req: Request, res: Response, next: Function):Promise<void> => {
    try {
      passport.authenticate("google", { session: false }, (err, user) => {
        if (err) {
          console.error("Google authentication error:", err);
          return res.redirect(`${process.env.CLIENT_SIDE_URL}?error=auth_failed`);
        }

        if (!user) {
          return res.redirect(`${process.env.CLIENT_SIDE_URL}?error=no_user`);
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
          ? `${process.env.CLIENT_SIDE_URL}/google-redirect?source=signup`
          : `${process.env.CLIENT_SIDE_URL}/google-redirect`;

        res.redirect(redirectUrl);
      })(req, res, next);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  home = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ message: "Welcome Home!" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { role } = req.body;
      const updated = await this.service.updateRole(userId, role);
      res.status(200).json({ message: "Role updated", user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth-token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  };
}
