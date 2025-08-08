export interface IEmailService {
  sendOTP(email: string, otp: string): Promise<void>;
  sendVerificationUpdateEmail(to: string, status: "approved" | "rejected" | "pending", reason?: string): Promise<void>
}