import { IUser } from "../../models/user.model";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(data: Partial<IUser>): Promise<IUser | null>;
  findByReferalCode(code: string): Promise<IUser | null>;
  updateOTP(email: string, code: string, expiresAt: Date): Promise<IUser | null>;
  verifyOTP(email: string, code: string): Promise<boolean | null>;
  updateUserRole(userId: string, role: "user" | "mentor"): Promise<IUser | null>;
  findAll(): Promise<Partial<IUser>[] | null>;
}
