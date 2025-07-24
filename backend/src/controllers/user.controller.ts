import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { error } from "console";
import { IUserController } from "./interfaces/IUserController";

export class UserController implements IUserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

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
      const { user, token } = await this.service.login(req.body);

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
