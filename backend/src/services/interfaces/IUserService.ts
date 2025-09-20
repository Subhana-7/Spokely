import {
  UserResponseDTO,
  SignupDTO,
  LoginDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  changePasswordDTO,
} from "../../dto/user.dto";

export interface IUserService {
  // generateUniqueCode(): Promise<string>;
  signup(data: SignupDTO): Promise<UserResponseDTO>;
  login(
    data: LoginDTO
  ): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ message: string }>;
  forgotPassword(data: ForgotPasswordDTO): Promise<void>;
  verifyForgotPassword(
    data: VerifyForgotPasswordDTO
  ): Promise<{ message: string }>;
  updateRole(userId: string, role: "user" | "mentor"): Promise<UserResponseDTO>;
  getAllUsers(): Promise<UserResponseDTO[]>;
  getHome(id: string): Promise<UserResponseDTO>;
  updateUser(id: string, data: Partial<any>): Promise<UserResponseDTO>;
  refreshToken(
    token: string
  ): Promise<{ user: UserResponseDTO; accessToken: string }>;
  changePassword(data: changePasswordDTO): Promise<{ message: string }>;
}
