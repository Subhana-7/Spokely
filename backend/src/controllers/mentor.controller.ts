import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utilis/token";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private service: IMentorService) {}

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorDTO = await this.service.signup(req.body);
      if (!mentorDTO) {
        res.status(401).json({ message: "Signup failed" });
        return;
      }
      res.status(201).json(mentorDTO);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      if (!result) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const { mentor, accessToken, refreshToken } = result;

      res.cookie("auth-token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("role", mentor.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ mentor });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(200).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.verifyOtp(
        req.body.email,
        req.body.code
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentors = await this.service.getAllMentors();
      res.status(200).json(mentors);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(200).json({ message: "Logged out successfully" });
  };

  updateMentorDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, documentUrl, textMessage } = req.body;
      const data = await this.service.updateMentorDocument(
        email,
        documentUrl,
        textMessage
      );
      res.status(200).json({
        success: true,
        message: "Document resubmitted successfully",
        data,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies["refresh-token"];
    if (!token) {
      res.status(401).json({ message: "Refresh token missing" });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: "user" | "mentor";
      };

      if (payload.role !== "mentor") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const mentor = await this.service.getHome(payload.id);
      if (!mentor) {
        res.status(404).json({ message: "Mentor not found" });
        return;
      }

      const newAccessToken = generateAccessToken({
        id: payload.id,
        role: payload.role,
      });

      res.cookie("auth-token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({ message: "Token refreshed", mentor });
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      if (!newPassword) {
        res.status(400).json({ message: "New password is required" });
        return;
      }

      await this.service.forgotPassword(email, newPassword);
      res.status(200).json({ message: "Password reset OTP sent to email" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  verifyForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.verifyForgotPassword(
        req.body.email,
        req.body.code
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  home = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentor = await this.service.getHome(req.params.id);
      if (!mentor) {
        res.status(404).json({ message: "Mentor not found" });
        return;
      }
      res.status(200).json(mentor);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentor = await this.service.getHome(req.params.id);
      if (!mentor) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(mentor);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  editMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const updateMentor = await this.service.updateMentor(
        req.params.id,
        req.body
      );
      if (!updateMentor) {
        res.status(404).json({ message: "Mentor not found" });
        return;
      }
      res.status(200).json(updateMentor);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
