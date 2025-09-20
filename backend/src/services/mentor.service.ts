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
import { ChangePasswordDTO, MentorResponseDTO } from "../dto/mentor.dto";
import { MESSAGES } from "../utilis/constants";

@injectable()
export class MentorService implements IMentorService {
  constructor(
    @inject(TYPES.IMentorRepository) private _mentorRepository: IMentorRepository,
    @inject(TYPES.IEmailService) private _emailService: IEmailService
  ) {}

  async generateUniqueCode(): Promise<string | null> {
    const generate = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = generate();
    while (await this._mentorRepository.findByUniqueCode(code)) {
      code = generate();
    }
    return code;
  }

  private async passwordValidation(password: string): Promise<void> {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new Error(MESSAGES.ERROR.INVALID_INPUT);
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<void> {
    const mentor = await this._mentorRepository.findByEmail(email);
    if (!mentor) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this._mentorRepository.updateOTP(email, otp, expiresAt);
    await this._emailService.sendOTP(email, otp);
  }

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    const isValid = await this._mentorRepository.verifyOTP(email, code);
    if (!isValid) throw new Error(MESSAGES.ERROR.OTP_INVALID);

    await this._emailService.sendVerificationUpdateEmail(email, "pending");

    return { message: MESSAGES.SUCCESS.USER_FETCHED };
  }

  async signup(data: any): Promise<MentorResponseDTO | null> {
    const existing = await this._mentorRepository.findByEmail(data.email);
    if (existing) throw new Error(MESSAGES.ERROR.EMAIL_EXISTS);

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const document = {
      documentUrl: data.documentUrl,
      textMessage: data.textMessage,
      verificationStatus: "pending",
    };

    const mentor = await this._mentorRepository.createMentor({
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
    const mentor = await this._mentorRepository.findByEmail(data.email);
    if (!mentor) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);

    if (!mentor.password) throw new Error(MESSAGES.ERROR.INVALID_INPUT);

    const match = await bcrypt.compare(data.password, mentor.password);
    if (!match) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);

    return {
      mentor: toMentorResponseDTO(mentor),
      accessToken: generateAccessToken({ id: mentor._id, role: "mentor" }),
      refreshToken: generateRefreshToken({ id: mentor._id, role: "mentor" }),
    };
  }

  async getAllMentors(): Promise<MentorResponseDTO[] | null> {
    const { results } = await this._mentorRepository.findAll();
    return results.length ? results.map(toMentorResponseDTO) : null;
  }

  async updateMentorDocument(
    email: string,
    docUrl: string,
    docMessage: string
  ): Promise<MentorResponseDTO | null> {
    const mentor = await this._mentorRepository.updateMentorDocument(email, docUrl, docMessage);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async forgotPassword(email: string, newPassword: string): Promise<void> {
    const mentor = await this._mentorRepository.findByEmail(email);
    if (!mentor) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);

    await this.passwordValidation(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this._mentorRepository.updateForgotPasswordOTP(email, otp, expiresAt, hashedPassword);
    await this._emailService.sendOTPEmail(email, otp, true);
  }

  async verifyForgotPassword(
    email: string,
    code: string
  ): Promise<{ message: string }> {
    const isValid = await this._mentorRepository.verifyForgotPasswordOTP(email, code);
    if (!isValid) throw new Error(MESSAGES.ERROR.OTP_INVALID);

    return { message: MESSAGES.SUCCESS.PASSWORD_RESET };
  }

  async getHome(id: string): Promise<MentorResponseDTO | null> {
    const mentor = await this._mentorRepository.findById(id);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async updateMentor(id: string, data: any): Promise<MentorResponseDTO | null> {
    const mentor = await this._mentorRepository.updateMentor(id, data);
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async changePassword(data: ChangePasswordDTO): Promise<{ message: string }> {
    const mentor = await this._mentorRepository.findById(data.id);
    if (!mentor) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
  
    if (!data.currentPassword || !data.newPassword) {
      throw new Error(MESSAGES.ERROR.INVALID_INPUT);
    }
  
    if(!mentor.password){
      throw new Error(MESSAGES.ERROR.INVALID_INPUT);
    }
  
    await this.passwordValidation(data.newPassword);
  
    const isMatch = await bcrypt.compare(data.currentPassword, mentor.password);
    if (!isMatch) {
      throw new Error(MESSAGES.ERROR.PASSWORD_MISMATCH);
    }
  
    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
  
    const updation = await this._mentorRepository.updatePassword(data.id, newHashedPassword);
    if (!updation) {
      throw new Error(MESSAGES.ERROR.PASSWORD_NOT_CHANGED);
    }
  
    return { message: MESSAGES.SUCCESS.PASSWORD_CHANGED };
  }
}
