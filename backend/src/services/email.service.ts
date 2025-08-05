import nodemailer from "nodemailer";
import { injectable } from "inversify";
import { IEmailService } from "./interfaces/IEmailService";

@injectable()
export class EmailService implements IEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationUpdateEmail(
    to: string,
    status: "approved" | "rejected" | "pending",
    reason?: string
  ): Promise<void> {
    let subject = "Spokely Mentor Verification Status";
    let text = "";

    switch (status) {
      case "approved":
        text = `Hi,\n\nYour mentor profile has been approved! You can now start using Spokely as a mentor.\n\nWelcome aboard!\n\n- Team Spokely`;
        break;
      case "rejected":
        text = `Hi,\n\nWe're sorry to inform you that your mentor profile was rejected.\nReason: ${
          reason ?? "Not specified"
        }\n\nYou may reapply with updated details.\n\n- Team Spokely`;
        break;
      case "pending":
        text = `Hi,\n\nThank you for applying to be a mentor on Spokely. Your application is under review.\nWe will notify you once it’s processed.\n\n- Team Spokely`;
        break;
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }

  async sendOTP(to: string, otp: string): Promise<void> {
    const subject = "Spokely OTP Verification Code";
    const text = `Hi,\n\nYour OTP code is: ${otp}\nIt is valid for 10 minutes.\n\n- Team Spokely`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }

  async sendOTPEmail(
    to: string,
    otp: string,
    isForgotPassword: boolean = false
  ): Promise<void | null> {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const subject = isForgotPassword
        ? "Password Reset Code"
        : "Your OTP Code";
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
}
