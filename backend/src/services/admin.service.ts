import bcrypt from "bcrypt";
import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { IEmailService } from "./interfaces/IEmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IAdminService } from "./interfaces/IAdminService";
import { IAdmin } from "../models/admin.model";
import { IMentor } from "../models/mentor.model";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";
import { mapAdminToDto, mapUserToSummaryDto } from "../mappers/admin.mapper";
import { AdminResponseDto, UserSummaryDto } from "../dto/admin.dto";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private repo: IAdminRepository,
    @inject(TYPES.IEmailService) private emailService: IEmailService
  ) {}

  async login(
    email: string,
    rawPassword: string
  ): Promise<{ admin: AdminResponseDto; accessToken: string; refreshToken: string } | null> {
    const admin = await this.repo.findByEmail(email);
    if (!admin) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(rawPassword, admin.password);
    if (!match) throw new Error("Invalid credentials");

    return {
      admin: mapAdminToDto(admin),
      accessToken: generateAccessToken({ id: admin._id, role: admin.role }),
      refreshToken: generateRefreshToken({ id: admin._id, role: admin.role }),
    };
  }

  async updateUserStatus(userId: string, status: string) {
    const actions: Record<string, () => Promise<any>> = {
      unBlocked: () => this.repo.unblockUser(userId),
      blocked: () => this.repo.blockUser(userId),
    };

    const action = actions[status];
    if (!action) throw new Error("Invalid status value");

    const result = await action();
    return {
      message: `User successfully ${status === "unBlocked" ? "unblocked" : "blocked"}.`,
      user: mapUserToSummaryDto(result),
    };
  }

  async updateMentorStatus(mentorId: string, status: string) {
    const actions: Record<string, () => Promise<any>> = {
      unBlocked: () => this.repo.unblockMentor(mentorId),
      blocked: () => this.repo.blockMentor(mentorId),
    };

    const action = actions[status];
    if (!action) throw new Error("Invalid status value");

    const result = await action();
    return {
      message: `Mentor successfully ${status === "unBlocked" ? "unblocked" : "blocked"}.`,
      user: result,
    };
  }

  async getMentor(id: string): Promise<IMentor[] | null> {
    return this.repo.getMentor(id);
  }

  async approveMentor(id: string): Promise<IMentor | null> {
    const mentor = await this.repo.getMentor(id);
    const email = mentor?.[0]?.email;
    if (email) await this.emailService.sendVerificationUpdateEmail(email, "approved");
    return this.repo.updateMentor(id);
  }

  async rejectMentor(id: string, reason: string): Promise<IMentor | null> {
    const mentor = await this.repo.getMentor(id);
    const email = mentor?.[0]?.email;
    if (email) await this.emailService.sendVerificationUpdateEmail(email, "rejected");
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
    isBlocked?: boolean; 
  }): Promise<{ users: UserSummaryDto[]; total: number }> {
    const { users, total } = await this.repo.findAllUsersWithQuery(params);
    return { users: users.map(mapUserToSummaryDto), total };
  }

  async getAllMentorsWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "students" | "sessions";
    verificationStatus?: "pending" | "approved" | "rejected";
    isBlocked?: boolean;
  }): Promise<{ mentors: IMentor[]; total: number }> {
    return this.repo.findAllMentorsWithQuery(params);
  }

  async getHome(id: string): Promise<AdminResponseDto | null> {
    const admin = await this.repo.findById(id);
    return admin ? mapAdminToDto(admin) : null;
  }
}
