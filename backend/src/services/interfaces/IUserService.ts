import { MentorDTO, MentorResponseDTO } from "../../dto/mentor.dto";
import {
  UserResponseDTO,
  SignupDTO,
  LoginDTO,
  changePasswordDTO,
  GoogleProfile,
} from "../../dto/user.dto";

export interface IUserService {
  // generateUniqueCode(): Promise<string>;
  signup(data: SignupDTO): Promise<UserResponseDTO>;
  login(data: LoginDTO): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ message: string }>;

  sendForgotPasswordOtp(email: string): Promise<void>;
  verifyForgotPasswordOtp(
    email: string,
    code: string
  ): Promise<{ message: string }>;
  resetPassword(email: string, newPassword: string): Promise<void>;

  updateRole(userId: string, role: "user" | "mentor"): Promise<UserResponseDTO>;
  getAllUsers(): Promise<UserResponseDTO[]>;
  getHome(userId: string): Promise<UserResponseDTO>;
  updateUser(userId: string, data: Partial<UserResponseDTO>): Promise<UserResponseDTO>;
  refreshToken(
    token: string
  ): Promise<{ user: UserResponseDTO; accessToken: string }>;
  changePassword(data: changePasswordDTO): Promise<{ message: string }>;
  generateUniqueCode(): Promise<string>;
  processGoogleAuth(
    profile: GoogleProfile
  ): Promise<{ user: any; accessToken: string; refreshToken: string }>;

  listMentors({}:unknown): Promise<{mentors:MentorResponseDTO,total:number,page:number,limit:number,totalPages:number}>;
}
