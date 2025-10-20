import { IMentor } from "../../models/mentor.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IMentorRepository extends IBaseRepository<IMentor> {
  findByEmail(email: string): Promise<IMentor | null>;
  createMentor(data: Partial<IMentor>): Promise<IMentor | null>;
  findByUniqueCode(code: string): Promise<IMentor | null>;
  updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IMentor | null>;
  verifyOTP(email: string, code: string): Promise<boolean | null>;
  findAll(
  query?: Partial<Record<keyof IMentor, any>>,
  options?: { page?: number; limit?: number }
): Promise<{ results: IMentor[]; total: number }>;
  updateMentorDocument(email: string, docMessage: string, docUrl: string): Promise<IMentor | null>;
  updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date,
    newPassword: string
  ): Promise<IMentor | null>;
  verifyForgotPasswordOTP(
    email: string,
    code: string
  ): Promise<boolean | null>;
  updatePassword(
    id: string,
    newPassword: string
  ): Promise<IMentor | null>;
  updateMentor(id: string, data: any): Promise<IMentor | null>;
  getDashboardData(mentorId: string): Promise<any>;
}