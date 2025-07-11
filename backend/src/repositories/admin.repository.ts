import Admin, { IAdmin } from "../models/admin.model";
import User, { IUser } from "../models/user.model";

export class AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email });
  }

  async findAllUsers(): Promise<Partial<IUser>[]> {
    return User.find({ role: "user" });
  }

  async findAllMentors(): Promise<Partial<IUser>[]> {
    return User.find({ role: "mentor" });
  }

  async blockUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  }

  async deleteUser(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }
}
