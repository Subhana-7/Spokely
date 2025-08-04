import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import nodemailer from "nodemailer";
import { IUserService } from "./interfaces/IUserService";
import { IUser } from "../models/user.model";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { Response } from "express";

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.IUserRepository) private repo: IUserRepository) {}

  async generateUniqueCode(): Promise<string | null> {
    try {
      const generateRandom = () =>
        Math.random().toString(36).substring(2, 8).toUpperCase();
      let code = generateRandom();
      let exists = await this.repo.findByUniqueCode(code);

      while (exists) {
        code = generateRandom();
        exists = await this.repo.findByUniqueCode(code);
      }
      return code;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  private async passwordValidation(password: string): Promise<void> {
    try {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        throw new Error(
          "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTPEmail(to: string, otp: string, isForgotPassword: boolean = false): Promise<void | null> {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const subject = isForgotPassword ? "Password Reset Code" : "Your OTP Code";
      const text = isForgotPassword 
        ? `Your password reset verification code is ${otp}. It expires in 10 minutes.`
        : `Your verification code is ${otp}. It expires in 10 minutes.`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async sendOtp(email: string): Promise<void | null> {
    try {
      const user = await this.repo.findByEmail(email);
      if (!user) throw new Error("User not found");

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.repo.updateOTP(email, otp, expiresAt);
      await this.sendOTPEmail(email, otp);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async verifyOtp(
    email: string,
    code: string
  ): Promise<{ message: string } | null> {
    const isValid = await this.repo.verifyOTP(email, code);
    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    return { message: "Email verified successfully" };
  }

  // New methods for forgot password
  async forgotPassword(email: string, newPassword: string): Promise<void | null> {
    try {
      const user = await this.repo.findByEmail(email);
      if (!user) throw new Error("User not found");

      // Validate the new password
      await this.passwordValidation(newPassword);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.repo.updateForgotPasswordOTP(email, otp, expiresAt, hashedPassword);
      await this.sendOTPEmail(email, otp, true);
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async verifyForgotPassword(
    email: string,
    code: string
  ): Promise<{ message: string } | null> {
    try {
      const isValid = await this.repo.verifyForgotPasswordOTP(email, code);
      if (!isValid) {
        throw new Error("Invalid or expired OTP");
      }

      return { message: "Password reset successfully" };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async signup(data: any): Promise<IUser | null> {
    try {
      await this.passwordValidation(data.password);

      const existing = await this.repo.findByEmail(data.email);
      if (existing) throw new Error("Email Already in use");
      const hashed = await bcrypt.hash(data.password, 10);
      const uniqueCode = await this.generateUniqueCode();

      return this.repo.createUser({
        ...data,
        password: hashed,
        uniqueCode,
      });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async login(data: any): Promise<{ user: IUser; token: string } | null> {
    try {
      const user = await this.repo.findByEmail(data.email);
      if (!user) throw new Error("Invalid email or password");

      if (!user.password) {
        throw new Error(
          "This user is registered via Google. Use Google sign-in."
        );
      }

      if (!data.password) {
        throw new Error("Password is required");
      }

      const match = await bcrypt.compare(data.password, user.password);
      if (!match) throw new Error("Invalid email or password");

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      return { user, token };
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateRole(
    userId: string,
    role: "user" | "mentor"
  ): Promise<IUser | null> {
    try {
      if (!["user", "mentor"].includes(role)) {
        throw new Error("Invalid role");
      }

      const updated = await this.repo.updateUserRole(userId, role);
      if (!updated) throw new Error("User not found");

      return updated;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAllUsers(): Promise<IUser[] | null> {
    try {
      return await this.repo.findAll();
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}