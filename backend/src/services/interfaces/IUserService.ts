import { MentorDTO, MentorResponseDTO } from "../../dto/mentor.dto";
import {
  UserResponseDTO,
  SignupDTO,
  LoginDTO,
  changePasswordDTO,
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

  // forgotPassword(data: ForgotPasswordDTO): Promise<void>;
  // verifyForgotPassword(
  //   data: VerifyForgotPasswordDTO
  // ): Promise<{ message: string }>;

  sendForgotPasswordOtp(email: string): Promise<void>;
  verifyForgotPasswordOtp(
    email: string,
    code: string
  ): Promise<{ message: string }>;
  resetPassword(email: string, newPassword: string): Promise<void>;

  updateRole(userId: string, role: "user" | "mentor"): Promise<UserResponseDTO>;
  getAllUsers(): Promise<UserResponseDTO[]>;
  getHome(userId: string): Promise<UserResponseDTO>;
  updateUser(userId: string, data: Partial<any>): Promise<UserResponseDTO>;
  refreshToken(
    token: string
  ): Promise<{ user: UserResponseDTO; accessToken: string }>;
  changePassword(data: changePasswordDTO): Promise<{ message: string }>;
  generateUniqueCode(): Promise<string>;
  processGoogleAuth(
    profile: any
  ): Promise<{ user: any; accessToken: string; refreshToken: string }>;

  listMentors({}:any): Promise<{ mentors: MentorDTO[] }>;
}
