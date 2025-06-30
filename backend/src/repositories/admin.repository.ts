import Admin, { IAdmin } from "../models/admin.model";
import User ,{IUser} from '../models/user.model'

export class AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email });
  }

  async findAllUsers(): Promise<Partial<IUser>[]> {
    return User.find({ role: "user" });
  }

  async findAllMentors():Promise<Partial<IUser>[]> {
    return User.find({role:"mentor"});
  }
}
