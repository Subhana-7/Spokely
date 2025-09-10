import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utilis/token";
import { StatusCode } from "../utilis/status.code";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private service: IMentorService) {}

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorDTO = await this.service.signup(req.body);
      if (!mentorDTO) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Signup failed" });
        return;
      }
      res.status(StatusCode.CREATED).json(mentorDTO);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      if (!result) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid credentials" });
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

      res.status(StatusCode.OK).json({ mentor });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(StatusCode.OK).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.verifyOtp(req.body.email, req.body.code);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentors = await this.service.getAllMentors();
      res.status(StatusCode.OK).json(mentors);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(StatusCode.OK).json({ message: "Logged out successfully" });
  };

  updateMentorDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, documentUrl, textMessage } = req.body;
      const data = await this.service.updateMentorDocument(email, documentUrl, textMessage);
      res.status(StatusCode.OK).json({
        success: true,
        message: "Document resubmitted successfully",
        data,
      });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies["refresh-token"];
    if (!token) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: "Refresh token missing" });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: "user" | "mentor";
      };

      if (payload.role !== "mentor") {
        res.status(StatusCode.FORBIDDEN).json({ message: "Forbidden" });
        return;
      }

      const mentor = await this.service.getHome(payload.id);
      if (!mentor) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Mentor not found" });
        return;
      }

      const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });

      res.cookie("auth-token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.status(StatusCode.OK).json({ message: "Token refreshed", mentor });
    } catch (err) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid or expired refresh token" });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      if (!newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "New password is required" });
        return;
      }

      await this.service.forgotPassword(email, newPassword);
      res.status(StatusCode.OK).json({ message: "Password reset OTP sent to email" });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  verifyForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.verifyForgotPassword(req.body.email, req.body.code);
      res.status(StatusCode.OK).json(result);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  home = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentor = await this.service.getHome(req.params.id);
      if (!mentor) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Mentor not found" });
        return;
      }
      res.status(StatusCode.OK).json(mentor);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentor = await this.service.getHome(req.params.id);
      if (!mentor) {
        res.status(StatusCode.NOT_FOUND).json({ message: "User not found" });
        return;
      }
      res.status(StatusCode.OK).json(mentor);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  editMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const updateMentor = await this.service.updateMentor(req.params.id, req.body);
      if (!updateMentor) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Mentor not found" });
        return;
      }
      res.status(StatusCode.OK).json(updateMentor);
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
  };
}
