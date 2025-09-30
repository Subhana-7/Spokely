import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IUserService } from "./interfaces/IUserService";
import { IUser } from "../models/user.model";
import {
  SignupDTO,
  LoginDTO,
  UserResponseDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  changePasswordDTO
} from "../dto/user.dto";
import { toUserResponseDTO } from "../mappers/user.mapper";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";
import { MESSAGES } from "../utilis/constants";

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.IUserRepository) private _userRepository: IUserRepository) {}

  private async passwordValidation(password: string) {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new Error(MESSAGES.ERROR.INVALID_INPUT);
    }
  }

  public generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTPEmail(to: string, otp: string, isForgotPassword = false) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const subject = isForgotPassword ? "Password Reset Code" : "Your OTP Code";
    const text = isForgotPassword
      ? `Your password reset verification code is ${otp}. It expires in 10 minutes.`
      : `Your verification code is ${otp}. It expires in 10 minutes.`;

    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  }

  async signup(data: SignupDTO): Promise<UserResponseDTO> {
    await this.passwordValidation(data.password);

    const existing = await this._userRepository.findByEmail(data.email);
    if (existing) throw new Error(MESSAGES.ERROR.EMAIL_EXISTS);

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const user = await this._userRepository.createUser({ ...data, password: hashed, uniqueCode });
    return toUserResponseDTO(user!);
  }

  async login(data: LoginDTO): Promise<{ user: UserResponseDTO; accessToken: string; refreshToken: string }> {
    const user = await this._userRepository.findByEmail(data.email);
    if (!user) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
    if (!user.password) throw new Error(MESSAGES.ERROR.ALREADY_VERIFIED); // Google registered case

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);

    return {
      user: toUserResponseDTO(user),
      accessToken: generateAccessToken({ id: user._id, role: user.role }),
      refreshToken: generateRefreshToken({ id: user._id, role: user.role }),
    };
  }

  async sendOtp(email: string): Promise<void> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this._userRepository.updateOTP(email, otp, expiresAt);
    await this.sendOTPEmail(email, otp);
  }

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    const isValid = await this._userRepository.verifyOTP(email, code);
    if (!isValid) throw new Error(MESSAGES.ERROR.OTP_INVALID);
    return { message: MESSAGES.SUCCESS.OTP_VERIFIED };
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const user = await this._userRepository.findByEmail(data.email);
    if (!user) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
    if (!data.newPassword) throw new Error(MESSAGES.ERROR.INVALID_INPUT);

    await this.passwordValidation(data.newPassword);
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this._userRepository.updateForgotPasswordOTP(data.email, otp, expiresAt, hashedPassword);
    await this.sendOTPEmail(data.email, otp, true);
  }

  async verifyForgotPassword(data: VerifyForgotPasswordDTO): Promise<{ message: string }> {
    const isValid = await this._userRepository.verifyForgotPasswordOTP(data.email, data.code);
    if (!isValid) throw new Error(MESSAGES.ERROR.OTP_INVALID);
    return { message: MESSAGES.SUCCESS.PASSWORD_RESET };
  }

  async updateRole(userId: string, role: "user" | "mentor"): Promise<UserResponseDTO> {
    if (!["user", "mentor"].includes(role)) throw new Error(MESSAGES.ERROR.INVALID_ROLE);
    const updated = await this._userRepository.updateUserRole(userId, role);
    if (!updated) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
    return toUserResponseDTO(updated);
  }

  async getHome(userId: string): Promise<UserResponseDTO> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
    return toUserResponseDTO(user);
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const { results } = await this._userRepository.findAll();
    return results.length ? results.map(toUserResponseDTO) : [];
  }

  async updateUser(userId: string, data: Partial<IUser>): Promise<UserResponseDTO> {
    const updatedUser = await this._userRepository.updateUser(userId, data);
    if (!updatedUser) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
    return toUserResponseDTO(updatedUser);
  }

  private async generateUniqueCode(): Promise<string> {
    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    while (await this._userRepository.findByUniqueCode(code)) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    return code;
  }

  async refreshToken(token: string): Promise<{ user: UserResponseDTO; accessToken: string }> {
    if (!token) throw new Error(MESSAGES.ERROR.INVALID_TOKEN);

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as { id: string; role: "user" | "mentor" };

      const user = await this.getHome(payload.id);
      const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });

      return { user, accessToken: newAccessToken };
    } catch {
      throw new Error(MESSAGES.ERROR.INVALID_TOKEN);
    }
  }

 async changePassword(data: changePasswordDTO): Promise<{ message: string }> {
  const user = await this._userRepository.findById(data.id);
  if (!user) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);

  if (!data.currentPassword || !data.newPassword) {
    throw new Error(MESSAGES.ERROR.INVALID_INPUT);
  }

  if(!user.password){
    throw new Error(MESSAGES.ERROR.INVALID_INPUT);
  }

  await this.passwordValidation(data.newPassword);

  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) {
    throw new Error(MESSAGES.ERROR.PASSWORD_MISMATCH);
  }

  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

  const updation = await this._userRepository.updatePassword(data.id, newHashedPassword);
  if (!updation) {
    throw new Error(MESSAGES.ERROR.PASSWORD_NOT_CHANGED);
  }

  return { message: MESSAGES.SUCCESS.PASSWORD_CHANGED };
}

}
