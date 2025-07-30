import { IMentorService } from "./interfaces/IMentorService";
import { IMentor } from "../models/mentor.model";
import { injectable, inject } from "inversify";
import { IMentorRepository } from "../repositories/interfaces/IMentorRepository";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { TYPES } from "../types/types";

@injectable()
export class MentorService implements IMentorService {
  constructor(
    @inject(TYPES.IMentorRepository) private repo: IMentorRepository
  ) {}

  async generateUniqueCode(): Promise<string | null> {
    const generate = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = generate();
    while (await this.repo.findByUniqueCode(code)) {
      code = generate();
    }
    return code;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTPEmail(to: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Your OTP Code",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });
  }

  async sendOtp(email: string): Promise<void> {
    console.log("mentor sendotp service")
    const mentor = await this.repo.findByEmail(email);
    if (!mentor) throw new Error("Mentor not found");

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.repo.updateOTP(email, otp, expiresAt);
    await this.sendOTPEmail(email, otp);
  }

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    console.log("mentor verify otp service")
    const isValid = await this.repo.verifyOTP(email, code);
    if (!isValid) throw new Error("Invalid or expired OTP");
    return { message: "Email verified successfully" };
  }

  async signup(data: any): Promise<IMentor | null> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    return this.repo.createMentor({ ...data, password: hashed, uniqueCode });
  }

  async login(data: any): Promise<{ mentor: IMentor; token: string } | null> {
    console.log("mentor login service");
    const mentor = await this.repo.findByEmail(data.email);
    if (!mentor) throw new Error("Invalid credentials");

    if (!mentor.password) throw new Error("Use Google login");

    const match = await bcrypt.compare(data.password, mentor.password);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: mentor._id, role: "mentor" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { mentor, token };
  }

  async getAllMentors(): Promise<IMentor[] | null> {
    return this.repo.findAll();
  }
}
