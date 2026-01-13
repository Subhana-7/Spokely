import {
  ChangePasswordDTO,
  MentorResponseDTO,
  MentorSignupDTO,
  MentorUpdateDTO,
} from "../../dto/mentor.dto";
import { LoginDTO } from "../../dto/user.dto";

export interface IMentorService {
  generateUniqueCode(): Promise<string>;

  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ message: string }>;

  signup(data: MentorSignupDTO): Promise<MentorResponseDTO | null>;
  login(data: LoginDTO): Promise<{
    mentor: MentorResponseDTO;
    accessToken: string;
    refreshToken: string;
  } | null>;

  getAllMentors(): Promise<MentorResponseDTO[] | null>;
  updateMentorDocument(
    email: string,
    docUrl: string,
    docMessage: string
  ): Promise<MentorResponseDTO | null>;

  forgotPassword(email: string, newPassword: string): Promise<void>;
  verifyForgotPassword(
    email: string,
    code: string
  ): Promise<{ message: string }>;

  getHome(id: string, months: number): Promise<unknown | null>;
  updateMentor(
    id: string,
    data: MentorUpdateDTO
  ): Promise<MentorResponseDTO | null>;

  changePassword(data: ChangePasswordDTO): Promise<{ message: string }>;

  refreshToken(
    token: string
  ): Promise<{ mentor: MentorResponseDTO; accessToken: string }>;
}
