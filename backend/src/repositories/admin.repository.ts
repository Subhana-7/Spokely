import Admin, { IAdmin } from "../models/admin.model";
import User, { IUser } from "../models/user.model";
import { IAdminRepository } from "./interfaces/IAdminRepository";
import { injectable } from "inversify";

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
      return User.find({ role: "user" });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findAllMentors(): Promise<IUser[] | null> {
    try {
      return User.find({ role: "mentor" });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async blockUser(id: string): Promise<IUser | null> {
    try {
      let result =  User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
      return result;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  // async deleteUser(id: string): Promise<IUser | null> {
  //   try {
  //     return User.findByIdAndDelete(id);
  //   } catch (error) {
  //     console.log("error", error);
  //     return null;
  //   }
  // }
}
