import { MentorResponseDTO } from "../../dto/mentor.dto";

export interface IMentorService {
  generateUniqueCode(): Promise<string | null>;

  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ message: string }>;

  signup(data: any): Promise<MentorResponseDTO | null>;
  login(
    data: any
  ): Promise<{
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

  getHome(id: string): Promise<MentorResponseDTO | null>;
  updateMentor(id: string, data: any): Promise<MentorResponseDTO | null>;
}
