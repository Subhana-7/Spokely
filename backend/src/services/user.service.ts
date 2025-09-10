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
} from "../dto/user.dto";
import { toUserResponseDTO } from "../mappers/user.mapper";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.IUserRepository) private repo: IUserRepository) {}

  private async passwordValidation(password: string) {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
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

    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email Already in use");

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const user = await this.repo.createUser({ ...data, password: hashed, uniqueCode });
    return toUserResponseDTO(user!);
  }

  async login(data: LoginDTO): Promise<{ user: UserResponseDTO; accessToken: string; refreshToken: string }> {
    const user = await this.repo.findByEmail(data.email);
    if (!user) throw new Error("Invalid email or password");
    if (!user.password) throw new Error("Google registered user. Use Google sign-in.");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error("Invalid email or password");

    return {
      user: toUserResponseDTO(user),
      accessToken: generateAccessToken({ id: user._id, role: user.role }),
      refreshToken: generateRefreshToken({ id: user._id, role: user.role }),
    };
  }

  async sendOtp(email: string): Promise<void> {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.updateOTP(email, otp, expiresAt);
    await this.sendOTPEmail(email, otp);
  }

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    const isValid = await this.repo.verifyOTP(email, code);
    if (!isValid) throw new Error("Invalid or expired OTP");
    return { message: "Email verified successfully" };
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const user = await this.repo.findByEmail(data.email);
    if (!user) throw new Error("User not found");
    if (!data.newPassword) throw new Error("New password is required");

    await this.passwordValidation(data.newPassword);
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.updateForgotPasswordOTP(data.email, otp, expiresAt, hashedPassword);
    await this.sendOTPEmail(data.email, otp, true);
  }

  async verifyForgotPassword(data: VerifyForgotPasswordDTO): Promise<{ message: string }> {
    const isValid = await this.repo.verifyForgotPasswordOTP(data.email, data.code);
    if (!isValid) throw new Error("Invalid or expired OTP");
    return { message: "Password reset successfully" };
  }

  async updateRole(userId: string, role: "user" | "mentor"): Promise<UserResponseDTO> {
    if (!["user", "mentor"].includes(role)) throw new Error("Invalid role");
    const updated = await this.repo.updateUserRole(userId, role);
    if (!updated) throw new Error("User not found");
    return toUserResponseDTO(updated);
  }

  async getHome(id: string): Promise<UserResponseDTO> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("User not found");
    return toUserResponseDTO(user);
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const {results} = await this.repo.findAll();
    return results.length ? results.map(toUserResponseDTO) : [];
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<UserResponseDTO> {
    const updatedUser = await this.repo.updateUser(id, data);
    if (!updatedUser) throw new Error("User not found");
    return toUserResponseDTO(updatedUser);
  }

  private async generateUniqueCode(): Promise<string> {
    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    while (await this.repo.findByUniqueCode(code)) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    return code;
  }

  async refreshToken(token: string): Promise<{ user: UserResponseDTO; accessToken: string }> {
  if (!token) throw new Error("Refresh token missing");

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as { id: string; role: "user" | "mentor" };

    const user = await this.getHome(payload.id);

    const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });

    return { user, accessToken: newAccessToken };
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
}

}
