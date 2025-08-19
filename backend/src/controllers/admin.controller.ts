import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminService } from "../services/admin.service";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { mapAdminToDto, mapUserToSummaryDto } from "../mappers/admin.mapper";
import { AdminLoginDto, AdminResponseDto } from "../dto/admin.dto";
import { toUserResponseDTO } from "../mappers/user.mapper";
import { generateAccessToken } from "../utilis/token";

export class AdminController implements IAdminController {
  constructor(@inject(TYPES.IAdminService) private service: IAdminService) {
    this.adminLogin = this.adminLogin.bind(this);
    this.listUsers = this.listUsers.bind(this);
    this.listMentors = this.listMentors.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
    // this.deleteUser = this.deleteUser.bind(this);
    this.mentorVerification = this.mentorVerification.bind(this);
    this.approveMentor = this.approveMentor.bind(this);
    this.rejectMentor = this.rejectMentor.bind(this);
    this.updateMentorStatus = this.updateMentorStatus.bind(this);
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);

      if (!result) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const {admin, accessToken, refreshToken} = result;

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

      res.cookie("role", admin.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const adminDTO = mapAdminToDto(admin)

      res.status(200).json({ admin: adminDTO });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  // async listUsers(req: Request, res: Response): Promise<void> {
  //   try {
  //     const users = await this.service.getAllUsers();
  //     const usersDto = users?.map(mapUserToSummaryDto);
  //     res.status(200).json(usersDto);
  //   } catch (err: any) {
  //     res.status(500).json({ error: err.message });
  //   }
  // }

  // async listMentors(req: Request, res: Response): Promise<void> {
  //   try {
  //     const mentors = await this.service.getAllMentors();
  //     res.status(200).json(mentors);
  //   } catch (err: any) {
  //     res.status(500).json({ error: err.message });
  //   }
  // }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.params;
      const { status } = req.body;

      const actions: Record<string, () => Promise<any>> = {
        unBlocked: () => this.service.unblockUser(userId),
        blocked: () => this.service.blockUser(userId),
      };

      const action = actions[status];

      // if (!action) {
      //   return res.status(400).json({ error: "Invalid status value" });
      // }

      const result = await action();

      res.status(200).json({
        message: `User successfully ${
          status === "unBlocked" ? "unblocked" : "blocked"
        }.`,
        user: result,
      });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user status",
      });
    }
  }

  async updateMentorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: mentorId } = req.params;
      const { status } = req.body;

      const actions: Record<string, () => Promise<any>> = {
        unBlocked: () => this.service.unblockMentor(mentorId),
        blocked: () => this.service.blockMentor(mentorId),
      };

      const action = actions[status];

      // if (!action) {
      //   return res.status(400).json({ error: "Invalid status value" });
      // }

      const result = await action();

      res.status(200).json({
        message: `Mentor successfully ${
          status === "unBlocked" ? "unblocked" : "blocked"
        }.`,
        user: result,
      });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user status",
      });
    }
  }

  // async deleteUser(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("controller - delete");
  //     const { id } = req.params;
  //     await this.service.deleteUser(id);
  //     res.status(200).json({ message: "User deleted" });
  //   } catch (err: any) {
  //     res.status(500).json({ error: err.message });
  //   }
  // }

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
      const {
        page = "1",
        limit = "10",
        search = "",
        level,
        minSessions,
        maxSessions,
        minMentors,
        maxMentors,
        isBlocked,
      } = req.query;

      const result = await this.service.getAllUsersWithQuery({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        level: level as string,
        minSessions: minSessions ? +minSessions : undefined,
        maxSessions: maxSessions ? +maxSessions : undefined,
        minMentors: minMentors ? +minMentors : undefined,
        maxMentors: maxMentors ? +maxMentors : undefined,
        isBlocked:
          isBlocked === "true"
            ? true
            : isBlocked === "false"
            ? false
            : undefined,
      });

      const usersDto = result.users.map(mapUserToSummaryDto);

      res.status(200).json({
        users: usersDto,
        total: result.total,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = "1",
        limit = "10",
        search = "",
        sortBy,
        verificationStatus,
        isBlocked,
      } = req.query;

      const result = await this.service.getAllMentorsWithQuery({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sortBy: sortBy as "students" | "sessions",
        verificationStatus: verificationStatus as
          | "pending"
          | "approved"
          | "rejected",
        isBlocked:
          isBlocked === "true"
            ? true
            : isBlocked === "false"
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

      const adminDTO = mapAdminToDto(admin);

      res.status(200).json(adminDTO);
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

      const admin = await this.service.getHome(payload.id);

      if (!admin) {
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
        maxAge: 15 * 60 * 1000, // 15 mins
      });
      
      const adminDTO = mapAdminToDto(admin);

      res.status(200).json({ message: "Token refreshed", user: adminDTO });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  }
}
