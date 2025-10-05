import User, { IUser } from "../models/user.model";
import { IUserRepository } from "./interfaces/IUserRepository";
import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import passport from "passport";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(User);
  }

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

  async verifyForgotPasswordOTP(
    email: string,
    code: string
  ): Promise<boolean | null> {
    try {
      const user = await User.findOne({ email });
      if (
        !user ||
        !user.forgotPasswordOtp ||
        user.forgotPasswordOtp.code !== code
      ) {
        return false;
      }

      const now = new Date();
      if (now > user.forgotPasswordOtp.expiresAt) {
        return false;
      }

      user.password = user.forgotPasswordOtp.newPassword;
      user.forgotPasswordOtp = undefined;
      await user.save();
      return true;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<IUser | null> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    );

    return updatedUser;
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

  async findAll(
    query: Partial<Record<keyof IUser, any>> = {},
    options?: { page?: number; limit?: number }
  ): Promise<{ results: IUser[]; total: number }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 0;
      const skip = (page - 1) * limit;

      const results = await User.find(
        query,
        "-password -otp -googleId -forgotPasswordOtp"
      )
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return { results, total };
    } catch (error) {
      console.log("error", error);
      return { results: [], total: 0 };
    }
  }

  async updateUser(id: string, data: any): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
