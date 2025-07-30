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
}
