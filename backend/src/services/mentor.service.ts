import { IMentorService } from "./interfaces/IMentorService";
import { IMentor } from "../models/mentor.model";
import { IEmailService } from "./interfaces/IEmailService";
import { injectable, inject } from "inversify";
import { IMentorRepository } from "../repositories/interfaces/IMentorRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TYPES } from "../types/types";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";
import { toMentorResponseDTO } from "../mappers/mentor.mapper";
import { MentorResponseDTO } from "../dto/mentor.dto";

@injectable()
export class MentorService implements IMentorService {
  constructor(
    @inject(TYPES.IMentorRepository) private repo: IMentorRepository,
    @inject(TYPES.IEmailService) private emailService: IEmailService
  ) {}

  async generateUniqueCode(): Promise<string | null> {
    const generate = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = generate();
    while (await this.repo.findByUniqueCode(code)) {
      code = generate();
    }
    return code;
  }

  private async passwordValidation(password: string): Promise<void> {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<void> {
    const mentor = await this.repo.findByEmail(email);
    if (!mentor) throw new Error("Mentor not found");

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.repo.updateOTP(email, otp, expiresAt);
    await this.emailService.sendOTP(email, otp);
  }

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    const isValid = await this.repo.verifyOTP(email, code);
    if (!isValid) throw new Error("Invalid or expired OTP");

    await this.emailService.sendVerificationUpdateEmail(email, "pending");

    return { message: "Email verified successfully" };
  }

  async signup(data: any): Promise<MentorResponseDTO | null> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const document = {
      documentUrl: data.documentUrl,
      textMessage: data.textMessage,
      verificationStatus: "pending",
    };

    const mentor = await this.repo.createMentor({
      ...data,
      password: hashed,
      uniqueCode,
      document,
    });

    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async login(data: any): Promise<{
    mentor: MentorResponseDTO;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const mentor = await this.repo.findByEmail(data.email);
    if (!mentor) throw new Error("Invalid credentials");

    if (!mentor.password) throw new Error("Use Google login");

    const match = await bcrypt.compare(data.password, mentor.password);
    if (!match) throw new Error("Invalid credentials");

    return {
      mentor: toMentorResponseDTO(mentor),
      accessToken: generateAccessToken({ id: mentor._id, role: "mentor" }),
      refreshToken: generateRefreshToken({ id: mentor._id, role: "mentor" }),
    };
  }

  async getAllMentors(): Promise<MentorResponseDTO[] | null> {
  const { results } = await this.repo.findAll();
  return results.length ? results.map(toMentorResponseDTO) : null;
}


  async updateMentorDocument(
    email: string,
    docUrl: string,
    docMessage: string
  ): Promise<MentorResponseDTO | null> {
    const mentor = await this.repo.updateMentorDocument(email, docUrl, docMessage);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async forgotPassword(email: string, newPassword: string): Promise<void> {
    const mentor = await this.repo.findByEmail(email);
    if (!mentor) throw new Error("Mentor not found");

    await this.passwordValidation(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.updateForgotPasswordOTP(email, otp, expiresAt, hashedPassword);
    await this.emailService.sendOTPEmail(email, otp, true);
  }

  async verifyForgotPassword(
    email: string,
    code: string
  ): Promise<{ message: string }> {
    const isValid = await this.repo.verifyForgotPasswordOTP(email, code);
    if (!isValid) throw new Error("Invalid or expired OTP");

    return { message: "Password reset successfully" };
  }

  async getHome(id: string): Promise<MentorResponseDTO | null> {
    const mentor = await this.repo.findById(id);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async updateMentor(id: string, data: any): Promise<MentorResponseDTO | null> {
    const mentor = await this.repo.updateMentor(id, data);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }
}
