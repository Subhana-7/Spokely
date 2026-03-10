import nodemailer from "nodemailer";
import { Resend } from "resend";
import { injectable } from "inversify";
import { IEmailService } from "./interfaces/IEmailService";
import {
  EMAIL_MESSAGES,
  VERIFICATION_STATUS,
  EMAIL_ERRORS,
  EMAIL_PROVIDER,
  DEFAULT_VALUES,
} from "../utilis/constants";

@injectable()
export class EmailService implements IEmailService {

   private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    console.log("RESEND KEY:", process.env.RESEND_API_KEY?.slice(0,5))
  }

  async sendVerificationUpdateEmail(
    to: string,
    status: (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS],
    reason?: string,
  ): Promise<void> {
    const subject = EMAIL_MESSAGES.VERIFICATION.SUBJECT;
    let text = "";

    switch (status) {
      case VERIFICATION_STATUS.APPROVED:
        text = EMAIL_MESSAGES.VERIFICATION.APPROVED;
        break;

      case VERIFICATION_STATUS.REJECTED:
        text = EMAIL_MESSAGES.VERIFICATION.REJECTED(
          reason ?? DEFAULT_VALUES.NOT_SPECIFIED,
        );
        break;

      case VERIFICATION_STATUS.PENDING:
        text = EMAIL_MESSAGES.VERIFICATION.PENDING;
        break;

      default:
        throw new Error(EMAIL_ERRORS.INVALID_VERIFICATION_STATUS);
    }

     await this.resend.emails.send({
      from: process.env.EMAIL_FROM || "Spokely <onboarding@resend.dev>",
      to,
      subject,
      text
    });
  }

  async sendOTP(to: string, otp: string): Promise<void> {
    const subject = EMAIL_MESSAGES.OTP.SUBJECT;
    const text = EMAIL_MESSAGES.OTP.TEXT(otp);

     await this.resend.emails.send({
      from: process.env.EMAIL_FROM || "Spokely <onboarding@resend.dev>",
      to,
      subject,
      text
    });
  }

  async sendOTPEmail(
    to: string,
    otp: string,
    isForgotPassword: boolean = false,
  ): Promise<void | null> {
    try {
      console.log("hit here");

      const subject = isForgotPassword
        ? EMAIL_MESSAGES.OTP_FORGOT_PASSWORD.SUBJECT
        : EMAIL_MESSAGES.OTP.SUBJECT;

      const text = isForgotPassword
        ? EMAIL_MESSAGES.OTP_FORGOT_PASSWORD.TEXT(otp)
        : EMAIL_MESSAGES.OTP.TEXT(otp);

      let res = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || "Spokely <onboarding@resend.dev>",
      to,
      subject,
      text
    });
    console.log("OTP email sent to:", to);
      console.log("node mailer", res);
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }
}
