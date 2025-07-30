import Mentor, { IMentor } from "../models/mentor.model";
import { IMentorRepository } from "./interfaces/IMentorRepository";
import { injectable } from "inversify";

@injectable()
export class MentorRepository implements IMentorRepository {
  async findByEmail(email: string): Promise<IMentor | null> {
    try {
      return Mentor.findOne({ email });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async createMentor(data: Partial<IMentor>): Promise<IMentor | null> {
    try {
      return Mentor.create(data);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findByUniqueCode(code: string): Promise<IMentor | null> {
    try {
      return Mentor.findOne({ uniqueCode: code });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IMentor | null> {
    try {
      return Mentor.findOneAndUpdate(
        { email },
        { otp: { code, expiresAt } },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async verifyOTP(email: string, code: string): Promise<boolean | null> {
    try {
      const mentor = await Mentor.findOne({ email });
      if (!mentor || !mentor.otp || mentor.otp.code !== code) return false;
      if (new Date() > mentor.otp.expiresAt) return false;
      mentor.isVerified = true;
      mentor.otp = undefined;
      await mentor.save();
      return true;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findAll(): Promise<IMentor[] | null> {
    try {
      return Mentor.find({}, "-password -otp -googleId");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
