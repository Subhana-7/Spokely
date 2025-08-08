import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import { toMentorResponseDTO } from "../mappers/mentor.mapper";
import { generateAccessToken } from "../utilis/token";
import jwt from "jsonwebtoken";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private service: IMentorService) {}

  signup = async (req: Request, res: Response) => {
    try {
      const mentor = await this.service.signup(req.body);
      const dto = toMentorResponseDTO(mentor!);
      res.status(201).json(dto);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
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
        maxAge: 15 * 60 * 1000, // 15 mins
      });
      res.cookie("refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie("role", mentor.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const dto = toMentorResponseDTO(mentor);
      res.status(200).json({ mentor: dto });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  sendOtp = async (req: Request, res: Response) => {
    await this.service.sendOtp(req.body.email);
    res.status(200).json({ message: "OTP sent" });
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;
      const result = await this.service.verifyOtp(email, code);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    const mentors = await this.service.getAllMentors();
    const dto = mentors!.map(toMentorResponseDTO);
    res.status(200).json(dto);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("role", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

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
        data: data,
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

      res.status(200).json({ message: "Token refreshed" });
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  };

  
  forgotPassword = async(
    req:Request,res:Response
  ):Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      
      if (!newPassword) {
        res.status(400).json({ message: "New password is required" });
        return;
      }

      await this.service.forgotPassword(email, newPassword);
      res.status(200).json({ message: "Password reset OTP sent to email" });
    } catch (error:any) {
      res.status(400).json({ message: error.message });
    }
  }

    verifyForgotPassword = async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const { email, code } = req.body;
        const result = await this.service.verifyForgotPassword(email, code);
        res.status(200).json(result);
      } catch (err: any) {
        res.status(400).json({ message: err.message });
      }
    };
}
