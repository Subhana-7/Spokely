import { IUser } from "../../models/user.model";
import { IAdmin } from "../../models/admin.model";
import { IMentor } from "../../models/mentor.model";

export interface IAdminService {
  login(email: string, rawPassword: string): Promise<Partial<IAdmin> | null>;
  getAllUsers(): Promise<IUser[] | null>;
  getAllMentors(): Promise<IMentor[] | null>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
  // deleteUser(id: string): Promise<IUser | null>;
  getMentor(id: string): Promise<IMentor[] | null>;
  approveMentor(id: string): Promise<IMentor | null>;
  rejectMentor(id: string, reason: string): Promise<IMentor | null>;
  blockMentor(id: string): Promise<IUser | null>;
  unblockMentor(id: string): Promise<IUser | null>;
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
  }): Promise<{ users: IUser[]; total: number }>;

  getAllMentorsWithQuery(params:{
    page?: number;
  limit?: number;
  search?: string;
  sortBy?: "students" | "sessions";
  verificationStatus?: "pending" | "approved" | "rejected";
  isBlocked?: boolean;
  }): Promise<{ users: IMentor[]; total: number }>
}
