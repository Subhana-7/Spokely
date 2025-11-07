import { IUser } from "../../models/user.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(data: Partial<IUser>): Promise<IUser | null>;
  findByUniqueCode(code: string): Promise<IUser | null>;
  updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IUser | null>;
  verifyOTP(email: string, code: string): Promise<boolean | null>;
  updateUserRole(
    userId: string,
    role: "user" | "mentor"
  ): Promise<IUser | null>;
  findAll(
    query?: Partial<Record<keyof IUser, any>>,
    options?: { page?: number; limit?: number }
  ): Promise<{ results: IUser[]; total: number }>;

  updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date,
    newPassword: string
  ): Promise<IUser | null>;
  verifyForgotPasswordOTP(email: string, code: string): Promise<boolean | null>;

  updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IUser | null>;

  verifyForgotPasswordOTP(email: string, code: string): Promise<boolean | null>;

  updatePasswordAndClearOTP(
    email: string,
    newPassword: string
  ): Promise<IUser | null>;

  updatePassword(id: string, newPassword: string): Promise<IUser | null>;
  updateUser(id: string, data: any): Promise<IUser | null>;

  getUserStats(userId: string): Promise<{
  sessionsDone: number;
  totalConnections: number;
  mentorsSubscribed: number;
  dailyTasksCompleted: number;
}>
}
