import { IUser } from "../../models/user.model";

export interface IUserService {
  generateUniqueCode(): Promise<string | null>;
  sendOtp(email: string): Promise<void | null>;
  verifyOtp(email: string, code: string): Promise<{ message: string } | null>;
  signup(data: any): Promise<IUser | null>;
  login(data: any): Promise<{ user: IUser; accessToken: string; refreshToken: string } | null>;
  updateRole(userId: string, role: "user" | "mentor"): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[] | null>;
  
  forgotPassword(email: string, newPassword: string): Promise<void | null>;
  verifyForgotPassword(email: string, code: string): Promise<{ message: string } | null>;

  getHome(id:string):Promise<IUser[] | null>;
}