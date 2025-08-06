import User, { IUser } from "../models/user.model";
import { IUserRepository } from "./interfaces/IUserRepository";
import { injectable } from "inversify";

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: String): Promise<IUser | null> {
    try {
      return User.findOne({ email });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async createUser(data: any): Promise<IUser | null> {
    try {
      return User.create(data);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findByUniqueCode(code: String): Promise<IUser | null> {
    try {
      return User.findOne({ uniqueCode: code });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IUser | null> {
    try {
      return User.findOneAndUpdate(
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
      const user = await User.findOne({ email });
      if (!user || !user.otp || user.otp.code !== code) return false;
      const now = new Date();
      if (now > user.otp.expiresAt) return false;
      user.isVerified = true;
      user.otp = undefined;
      await user.save();
      return true;
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
  ): Promise<IUser | null> {
    try {
      return User.findOneAndUpdate(
        { email },
        { forgotPasswordOtp: { code, expiresAt, newPassword } },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async verifyForgotPasswordOTP(email: string, code: string): Promise<boolean | null> {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.forgotPasswordOtp || user.forgotPasswordOtp.code !== code) {
        return false;
      }
      
      const now = new Date();
      if (now > user.forgotPasswordOtp.expiresAt) {
        return false;
      }

      // Update password and clear forgot password OTP
      user.password = user.forgotPasswordOtp.newPassword;
      user.forgotPasswordOtp = undefined;
      await user.save();
      return true;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updatePassword(email: string, password: string): Promise<IUser | null> {
    try {
      return User.findOneAndUpdate(
        { email },
        { password },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateUserRole(
    userId: string,
    role: "user" | "mentor"
  ): Promise<IUser | null> {
    try {
      return User.findByIdAndUpdate(userId, { role }, { new: true });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findAll(): Promise<IUser[] | null> {
    try {
      return await User.find({}, "-password -otp -googleId -forgotPasswordOtp");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findById(id:string):Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}