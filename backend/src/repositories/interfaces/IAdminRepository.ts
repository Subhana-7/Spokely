import { IAdmin } from "../../models/admin.model";
import { IUser } from "../../models/user.model";
import { IMentor } from "../../models/mentor.model";
import { SORT_BY } from "../../utilis/constants";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findAllUsers(): Promise<IUser[] | null>;
  findAllMentors(): Promise<IMentor[] | null>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
  // deleteUser(id: string): Promise<IUser | null>;
  getMentor(id: string): Promise<IMentor[] | null>;
  updateMentor(id: string): Promise<IMentor | null>;
  updateMentorRejection(id: string, reason: string): Promise<IMentor | null>;
  blockMentor(id: string): Promise<IUser | null>;
  unblockMentor(id: string): Promise<IUser | null>;

  findAllUsersWithQuery(params: {
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

  findAllMentorsWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string | (typeof SORT_BY)[keyof typeof SORT_BY];
    verificationStatus?: "pending" | "approved" | "rejected";
    isBlocked?: boolean;
  }): Promise<{ mentors: IMentor[]; total: number }>;

  findById(id: string): Promise<IAdmin | null>;

   findAllMentorsPaginated(
  query: any,
  options: { page: number; limit: number }
):Promise<any>;
}
