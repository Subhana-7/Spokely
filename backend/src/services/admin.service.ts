import bcrypt from "bcrypt";
import { AdminRepository } from "../repositories/admin.repository";
import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { IEmailService } from "./interfaces/IEmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IAdminService } from "./interfaces/IAdminService";
import User, { IUser } from "../models/user.model";
import { IAdmin } from "../models/admin.model";
import { IMentor } from "../models/mentor.model";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private repo: IAdminRepository,
    @inject(TYPES.IEmailService) private emailService: IEmailService
  ) {}

  async login(
    email: string,
    rawPassword: string
  ): Promise<{
    admin: IAdmin;
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      const admin = await this.repo.findByEmail(email);
    if (!admin) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(rawPassword, admin.password);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return {
      admin,
      accessToken:generateAccessToken({id:admin._id, role:admin.role}),
      refreshToken:generateRefreshToken({id:admin._id,role:admin.role}),
    };
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAllUsers(): Promise<IUser[] | null> {
    return this.repo.findAllUsers();
  }

  async getAllMentors(): Promise<IMentor[] | null> {
    return this.repo.findAllMentors();
  }

  async blockUser(id: string): Promise<IUser | null> {
    return this.repo.blockUser(id);
  }

  async unblockUser(id: string): Promise<IUser | null> {
    return this.repo.unblockUser(id);
  }

  async blockMentor(id: string): Promise<IUser | null> {
    return this.repo.blockMentor(id);
  }

  async unblockMentor(id: string): Promise<IUser | null> {
    return this.repo.unblockMentor(id);
  }

  // async deleteUser(id: string): Promise<IUser | null> {
  //   return this.repo.deleteUser(id);
  // }

  async getMentor(id: string): Promise<IMentor[] | null> {
    return this.repo.getMentor(id);
  }

  async approveMentor(id: string): Promise<IMentor | null> {
    const mentor = await this.repo.getMentor(id);
    const email = mentor?.[0]?.email;
    if (!email) {
      console.error("Mentor email not found.");
      return null;
    }
    await this.emailService.sendVerificationUpdateEmail(email, "approved");
    return this.repo.updateMentor(id);
  }

  async rejectMentor(id: string, reason: string): Promise<IMentor | null> {
    const mentor = await this.repo.getMentor(id);
    const email = mentor?.[0]?.email;
    if (!email) {
      console.error("Mentor email not found.");
      return null;
    }
    await this.emailService.sendVerificationUpdateEmail(email, "rejected");
    return this.repo.updateMentorRejection(id, reason);
  }

  async getAllUsersWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    minSessions?: number;
    maxSessions?: number;
    minMentors?: number;
    maxMentors?: number;
    isBlocked: boolean;
  }) {
    return this.repo.findAllUsersWithQuery(params);
  }

  async getAllMentorsWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "students" | "sessions";
    verificationStatus?: "pending" | "approved" | "rejected";
    isBlocked?: boolean;
  }): Promise<{ users: IMentor[]; total: number }> {
    const { mentors, total } = await this.repo.findAllMentorsWithQuery(params);
    return { users: mentors, total };
  }

  async getHome(id: string): Promise<IAdmin | null> {
    try {
      return await this.repo.findById(id);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
