import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminService } from "../services/admin.service";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { mapUserToSummaryDto } from "../mappers/admin.mapper";

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
      const admin = await this.service.login(email, password);

      if (!admin) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.status(200).json({ token });
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

}
