import { IMentor } from "../../models/mentor.model";

export interface IMentorRepository {
  findByEmail(email: string): Promise<IMentor | null>;
  createMentor(data: Partial<IMentor>): Promise<IMentor | null>;
  findByUniqueCode(code: string): Promise<IMentor | null>;
  updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IMentor | null>;
  verifyOTP(email: string, code: string): Promise<boolean | null>;
  findAll(): Promise<IMentor[] | null>;
  updateMentorDocument(email:string,docMessage:string,docUrl:string):Promise<IMentor | null>;

  updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date,
    newPassword: string
  ): Promise<IMentor | null>
  verifyForgotPasswordOTP(
    email: string,
    code: string
  ): Promise<boolean | null>
  updatePassword(
    email:string,
    password:string
  ):Promise<IMentor | null>

  findById(id:string):Promise<IMentor | null>;
}
