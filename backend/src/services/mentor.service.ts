import { IMentorService } from "./interfaces/IMentorService";
import { IMentor } from "../models/mentor.model";
import { IEmailService } from "./interfaces/IEmailService";
import { injectable, inject } from "inversify";
import { IMentorRepository } from "../repositories/interfaces/IMentorRepository";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { TYPES } from "../types/types";

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

    await this.emailService.sendVerificationUpdateEmail(email,'pending');
    
    return { message: "Email verified successfully" };
  }

  async signup(data: any): Promise<IMentor | null> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(data.password, 10);
    const uniqueCode = await this.generateUniqueCode();

    const document = {
      documentUrl: data.documentUrl,
      textMessage: data.textMessage,
      verificationStatus: "pending",
    };

    return this.repo.createMentor({
      ...data,
      password: hashed,
      uniqueCode,
      document,
    });
  }

  async login(data: any): Promise<{ mentor: IMentor; token: string } | null> {
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

  async updateMentorDocument(email:string,docUrl:string,docMessage:string,):Promise<IMentor | null>{
    return this.repo.updateMentorDocument(email,docUrl,docMessage,);
  }
}
