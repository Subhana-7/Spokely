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
import {
  MESSAGES,
  MENTOR_MESSAGES,
  VERIFICATION_STATUS,
  ROLES,
  ACCOUNT_STATUS
} from "../utilis/constants";

@injectable()
export class MentorService implements IMentorService {
  constructor(
    @inject(TYPES.IMentorRepository)
    private _mentorRepository: IMentorRepository,

    @inject(TYPES.IEmailService)
    private _emailService: IEmailService
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
      throw new Error(MENTOR_MESSAGES.ERROR.INVALID_PASSWORD);
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

    await this._emailService.sendVerificationUpdateEmail(
      email,
      VERIFICATION_STATUS.PENDING
    );

    return { message: MENTOR_MESSAGES.SUCCESS.OTP_VERIFICATION };
  }

  async signup(data: any): Promise<MentorResponseDTO | null> {
    const existing = await this._mentorRepository.findByEmail(data.email);
    if (existing) throw new Error(MESSAGES.ERROR.EMAIL_EXISTS);

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const document = {
      documentUrl: data.documentUrl,
      textMessage: data.textMessage,
      verificationStatus: VERIFICATION_STATUS.PENDING,
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

    if (mentor.document.verificationStatus === ACCOUNT_STATUS.PENDING) {
      throw new Error(MESSAGES.ERROR.ADMIN_APPROVE_PENDING);
    }

    return {
      mentor: toMentorResponseDTO(mentor),
      accessToken: generateAccessToken({
        id: mentor._id,
        role: ROLES.MENTOR,
        status: mentor.isBlocked,
      }),
      refreshToken: generateRefreshToken({
        id: mentor._id,
        role: ROLES.MENTOR,
        status: mentor.isBlocked,
      }),
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
    const mentor = await this._mentorRepository.updateMentorDocument(
      email,
      docUrl,
      docMessage
    );
    return mentor ? toMentorResponseDTO(mentor) : null;
  }

  async forgotPassword(email: string, newPassword: string): Promise<void> {
    const mentor = await this._mentorRepository.findByEmail(email);
    if (!mentor) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);

    await this.passwordValidation(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this._mentorRepository.updateForgotPasswordOTP(
      email,
      otp,
      expiresAt,
      hashedPassword
    );

    await this._emailService.sendOTPEmail(email, otp, true);
  }

  async verifyForgotPassword(
    email: string,
    code: string
  ): Promise<{ message: string }> {
    const isValid = await this._mentorRepository.verifyForgotPasswordOTP(
      email,
      code
    );

    if (!isValid) throw new Error(MESSAGES.ERROR.OTP_INVALID);

    return { message: MENTOR_MESSAGES.SUCCESS.PASSWORD_UPDATED };
  }

  async getHome(id: string, months = 6): Promise<any | null> {
    const mentor = await this._mentorRepository.findById(id);
    if (!mentor) return null;

    const dashboardData = await this._mentorRepository.getDashboardData(
      id,
      months
    );

    if (!dashboardData) return null;

    return {
      mentor: toMentorResponseDTO(mentor),
      stats: {
        totalStudents: dashboardData.totalStudents,
        todaysSessionsCount: dashboardData.todaysSessionsCount,
        avgProgress: dashboardData.avgProgress,
        avgFeedback: dashboardData.avgFeedback,
        avgFeedbackValue: dashboardData.avgFeedbackValue,
      },
      sessionsToday: dashboardData.sessionsToday,
      recentActivities: dashboardData.recentActivities,
      chartData: dashboardData.chartData,
    };
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

    if (!mentor.password) {
      throw new Error(MESSAGES.ERROR.INVALID_INPUT);
    }

    await this.passwordValidation(data.newPassword);

    const isMatch = await bcrypt.compare(data.currentPassword, mentor.password);
    if (!isMatch) {
      throw new Error(MESSAGES.ERROR.PASSWORD_MISMATCH);
    }

    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

    const updation = await this._mentorRepository.updatePassword(
      data.id,
      newHashedPassword
    );

    if (!updation) {
      throw new Error(MESSAGES.ERROR.PASSWORD_NOT_CHANGED);
    }

    return { message: MESSAGES.SUCCESS.PASSWORD_CHANGED };
  }

  async refreshToken(
    token: string
  ): Promise<{ mentor: MentorResponseDTO; accessToken: string }> {
    if (!token) throw new Error(MESSAGES.ERROR.INVALID_TOKEN);

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: string;
      };

      if (payload.role !== ROLES.MENTOR) {
        throw new Error(MESSAGES.ERROR.FORBIDDEN);
      }

      const mentor = await this._mentorRepository.findById(payload.id);

      if (!mentor) {
        throw new Error(MENTOR_MESSAGES.ERROR.MENTOR_NOT_FOUND);
      }

      console.log(mentor);

      const newAccessToken = generateAccessToken({
        id: payload.id,
        role: ROLES.MENTOR,
        status: mentor.isBlocked,
      });

      return {
        mentor: toMentorResponseDTO(mentor),
        accessToken: newAccessToken,
      };
    } catch (err: unknown) {
      throw new Error(MENTOR_MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
    }
  }
}
