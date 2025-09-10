import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { generateAccessToken } from "../utilis/token";

export class AdminController implements IAdminController {
  constructor(@inject(TYPES.IAdminService) private service: IAdminService) {}

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);

      if (!result) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const { admin, accessToken, refreshToken } = result;

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
      res.cookie("role", admin.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ admin });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.params;
      const { status } = req.body;

      const result = await this.service.updateUserStatus(userId, status);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMentorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: mentorId } = req.params;
      const { status } = req.body;

      const result = await this.service.updateMentorStatus(mentorId, status);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async mentorVerification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service.getMentor(id);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approveMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service.approveMentor(id);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const data = await this.service.rejectMentor(id, rejectionReason);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.getAllUsersWithQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        level: req.query.level as string,
        minSessions: req.query.minSessions ? +req.query.minSessions : undefined,
        maxSessions: req.query.maxSessions ? +req.query.maxSessions : undefined,
        minMentors: req.query.minMentors ? +req.query.minMentors : undefined,
        maxMentors: req.query.maxMentors ? +req.query.maxMentors : undefined,
        isBlocked:
          req.query.isBlocked === "true"
            ? true
            : req.query.isBlocked === "false"
            ? false
            : undefined,
      });

      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.getAllMentorsWithQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: req.query.sortBy as "students" | "sessions",
        verificationStatus: req.query.verificationStatus as
          | "pending"
          | "approved"
          | "rejected",
        isBlocked:
          req.query.isBlocked === "true"
            ? true
            : req.query.isBlocked === "false"
            ? false
            : undefined,
      });

      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async home(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const admin = await this.service.getHome(id);

      if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
      }

      res.status(200).json(admin);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies["refresh-token"];

    if (!token) {
      res.status(401).json({ message: "Refresh token missing" });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: "user" | "mentor" | "admin";
      };

      if (payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const result = await this.service.getHome(payload.id);

      if (!result) {
        res.status(404).json({ message: "Admin not found" });
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

      res.status(200).json({ message: "Token refreshed", user: result });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
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
  }
}
