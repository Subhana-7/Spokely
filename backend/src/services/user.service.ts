import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import nodemailer from "nodemailer";

export class UserService {
  private repo = new UserRepository();

  async generateUniqueReferralCode(): Promise<string> {
    const generateRandom = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = generateRandom();
    let exists = await this.repo.findByReferalCode(code);

    while (exists) {
      code = generateRandom();
      exists = await this.repo.findByReferalCode(code);
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

  async sendOtp(email: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await this.repo.updateOTP(email, otp, expiresAt);
    await this.sendOTPEmail(email, otp);
  }

  async verifyOtp(email: string, code: string) {
    const isValid = await this.repo.verifyOTP(email, code);
    if (!isValid) throw new Error("Invalid or expired OTP");
    return { message: "Email verified successfully" };
  }

  async signup(data: any) {
    await this.passwordValidation(data.password);

    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email Already in use");
    const hashed = await bcrypt.hash(data.password, 10);
    const referalCode = await this.generateUniqueReferralCode();

    return this.repo.createUser({
      ...data,
      password: hashed,
      referalCode,
    });
  }

  async login(data: any) {
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
  }

  async updateRole(userId: string, role: "user" | "mentor") {
    if (!["user", "mentor"].includes(role)) {
      throw new Error("Invalid role");
    }

    const updated = await this.repo.updateUserRole(userId, role);
    if (!updated) throw new Error("User not found");

    return updated;
  }
  
  async getAllUsers() {
    return await this.repo.findAll();
  }
}
