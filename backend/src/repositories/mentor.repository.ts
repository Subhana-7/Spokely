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

  async updateMentorDocument(
    email: string,
    docUrl: string,
    docMessage: string
  ): Promise<IMentor | null> {
    console.log("repo this is update doc");
    try {
      return await Mentor.findOneAndUpdate(
        { email },
        {
          $set: {
            "document.documentUrl": docUrl,
            "document.textMessage": docMessage,
            "document.verificationStatus": "pending",
            "document.rejectionReason": "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date,
    newPassword: string
  ): Promise<IMentor | null> {
    try {
      return Mentor.findOneAndUpdate(
        { email },
        { forgotPasswordOtp: { code, expiresAt, newPassword } },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async verifyForgotPasswordOTP(
    email: string,
    code: string
  ): Promise<boolean | null> {
    try {
      const mentor = await Mentor.findOne({ email });
      if (
        !mentor ||
        !mentor.forgotPasswordOtp ||
        mentor.forgotPasswordOtp.code !== code
      ) {
        return false;
      }

      const now = new Date();
      if (now > mentor.forgotPasswordOtp.expiresAt) {
        return false;
      }

      mentor.password = mentor.forgotPasswordOtp.newPassword;
      mentor.forgotPasswordOtp = undefined;
      await mentor.save();
      return true;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updatePassword(
    email:string,
    password:string
  ):Promise<IMentor | null>{
    try {
      return Mentor.findOneAndUpdate(
        {email},
        {password},
        {new:true}
      )
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

    async findById(id:string):Promise<IMentor | null> {
      try {
        return await Mentor.findById(id);
      } catch (error) {
        console.log("error", error);
        return null;
      }
    }
}
