import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import { toMentorResponseDTO } from "../mappers/mentor.mapper";
import { generateAccessToken } from "../utilis/token";
import jwt from "jsonwebtoken";
import {
  LoginDTO,
  SignupDTO,
  SendOtpDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
} from "../dto/mentor.dto";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private service: IMentorService) {}

  signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
    try {
      const mentor = await this.service.signup(req.body);

      if (!mentor) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const mentorDTO = toMentorResponseDTO(mentor);
      res.status(201).json(mentorDTO);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (
    req: Request<{}, {}, LoginDTO>,
    res: Response
  ): Promise<void> => {
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

      const mentorDTO = toMentorResponseDTO(mentor);
      res.status(200).json({ mentor: mentorDTO });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  sendOtp = async (req: Request<{}, {}, SendOtpDTO>, res: Response) => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(200).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
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

      console.log(payload);

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

      const mentorDto = toMentorResponseDTO(mentor);

      res.status(200).json({ message: "Token refreshed", mentor: mentorDto });
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  };

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordDTO>,
    res: Response
  ): Promise<void> => {
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
      const { email, code } = req.body;
      const result = await this.service.verifyForgotPassword(email, code);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  home = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const mentor = await this.service.getHome(id);

      if (!mentor) {
        res.status(404).json({ message: "Mentor not found" });
        return;
      }

      const mentorDTO = toMentorResponseDTO(mentor);
      res.status(200).json(mentorDTO);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;

      const mentor = await this.service.getHome(id);

      if (!mentor) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const mentorDTO = toMentorResponseDTO(mentor);
      console.log(mentorDTO)
      res.status(200).json(mentorDTO);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  editMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = req.body;

      const updateMentor = await this.service.updateMentor(id, data);

      if (!updateMentor) {
        res.status(404).json({ message: "Mentor not found" });
        return;
      }

      const mentorDTO = toMentorResponseDTO(updateMentor);
      res.status(200).json(mentorDTO);
    } catch (error) {
      console.error("editUser error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
