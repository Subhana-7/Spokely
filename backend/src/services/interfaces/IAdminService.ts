import { IMentor } from "../../models/mentor.model";
import { AdminResponseDto, UserSummaryDto } from "../../dto/admin.dto";

export interface IAdminService {
  login(
    email: string,
    rawPassword: string
  ): Promise<{ admin: AdminResponseDto; accessToken: string; refreshToken: string } | null>;

  updateUserStatus(
    userId: string,
    status: string
  ): Promise<{ message: string; user: UserSummaryDto }>;

  updateMentorStatus(
    mentorId: string,
    status: string
  ): Promise<{ message: string; user: IMentor }>;

  getMentor(id: string): Promise<IMentor[] | null>;

  approveMentor(id: string): Promise<IMentor | null>;

  rejectMentor(id: string, reason: string): Promise<IMentor | null>;

  getAllUsersWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    minSessions?: number;
    maxSessions?: number;
    minMentors?: number;
    maxMentors?: number;
    isBlocked?: boolean; 
  }): Promise<{ users: UserSummaryDto[]; total: number }>;

  getAllMentorsWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "students" | "sessions";
    verificationStatus?: "pending" | "approved" | "rejected";
    isBlocked?: boolean;
  }): Promise<{ mentors: IMentor[]; total: number }>;

  getHome(id: string): Promise<AdminResponseDto | null>;
}
