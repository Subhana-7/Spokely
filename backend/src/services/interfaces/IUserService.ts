import { IUser } from "../../models/user.model";

export interface IUserService {
  generateUniqueReferralCode(): Promise<string | null>;
  sendOtp(email: string): Promise<void | null>;
  verifyOtp(email: string, code: string): Promise<{ message: string } | null>;
  signup(data: any): Promise<IUser | null>;
  login(data: any): Promise<{ user: IUser; token: string } | null>;
  updateRole(userId: string, role: "user" | "mentor"): Promise<IUser | null>;
  getAllUsers(): Promise<Partial<IUser>[] | null>;
}
