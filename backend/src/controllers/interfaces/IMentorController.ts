import { Request, Response } from "express";
import { MentorResponseDTO } from "../../dto/mentor.dto";

export interface IMentorController {
  signup(
    req: Request,
    res: Response<MentorResponseDTO | { message: string }>
  ): Promise<void>;

  login(
    req: Request,
    res: Response<{ mentor: MentorResponseDTO } | { message: string }>
  ): Promise<void>;

  sendOtp(req: Request, res: Response<{ message: string }>): Promise<void>;

  verifyOtp(req: Request, res: Response<{ message: string }>): Promise<void>;

  logout(req: Request, res: Response<{ message: string }>): Promise<void>;

  getAll(
    req: Request,
    res: Response<MentorResponseDTO[] | { message: string }>
  ): Promise<void>;

  updateMentorDocument(
    req: Request,
    res: Response<
      | { success: boolean; message: string; data?: MentorResponseDTO }
      | { message: string }
    >
  ): Promise<void>;

  refreshToken(
    req: Request,
    res: Response<{ message: string; mentor?: MentorResponseDTO }>
  ): Promise<void>;

  forgotPassword(
    req: Request,
    res: Response<{ message: string }>
  ): Promise<void>;

  verifyForgotPassword(
    req: Request,
    res: Response<{ message: string }>
  ): Promise<void>;

  home(
    req: Request,
    res: Response<MentorResponseDTO | { message: string }>
  ): Promise<void>;

  profile(
    req: Request,
    res: Response<MentorResponseDTO | { message: string }>
  ): Promise<void>;

  editMentor(
    req: Request,
    res: Response<MentorResponseDTO | { message: string }>
  ): Promise<void>;
}
