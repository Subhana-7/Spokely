import { IMentor } from "../../models/mentor.model";

export interface IMentorService {
  generateUniqueCode(): Promise<string | null>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<{ message: string }>;
  signup(data: any): Promise<IMentor | null>;
  login(data: any): Promise<{ mentor: IMentor; token: string } | null>;
  getAllMentors(): Promise<IMentor[] | null>;
  updateMentorDocument(email:string,docMessage:string,docUrl:string):Promise<IMentor | null>;

  forgotPassword(email: string, newPassword: string): Promise<void | null>;
  verifyForgotPassword(email: string, code: string): Promise<{ message: string } | null>;
}
