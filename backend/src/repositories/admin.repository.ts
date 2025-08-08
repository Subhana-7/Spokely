import Admin, { IAdmin } from "../models/admin.model";
import User, { IUser } from "../models/user.model";
import { IAdminRepository } from "./interfaces/IAdminRepository";
import { injectable } from "inversify";
import Mentor, { IMentor } from "../models/mentor.model";

@injectable()
export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      return Admin.findOne({ email });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findAllUsers(): Promise<IUser[] | null> {
    try {
      return User.find();
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findAllMentors(): Promise<IMentor[] | null> {
    try {
      return Mentor.find();
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async blockUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  }

  async unblockUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  }

  async blockMentor(id: string): Promise<IUser | null> {
    return Mentor.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  }

  async unblockMentor(id: string): Promise<IUser | null> {
    return Mentor.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  }

  // async deleteUser(id: string): Promise<IUser | null> {
  //   try {
  //     return User.findByIdAndDelete(id);
  //   } catch (error) {
  //     console.log("error", error);
  //     return null;
  //   }
  // }

  async getMentor(id: string): Promise<IMentor[] | null> {
    try {
      let result = await Mentor.find({
        _id: id,
        isVerified: true,
      });
      return result;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateMentor(id: string): Promise<IMentor | null> {
    try {
      let res = await Mentor.findByIdAndUpdate(
        id,
        { "document.verificationStatus": "approved" },
        { new: true }
      );
      return res;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateMentorRejection(
    id: string,
    reason: string
  ): Promise<IMentor | null> {
    try {
      let res = await Mentor.findByIdAndUpdate(
        id,
        {
          "document.verificationStatus": "rejected",
          "document.rejectionReason": reason,
        },
        { new: true }
      );
      return res;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
