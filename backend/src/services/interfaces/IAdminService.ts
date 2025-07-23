import { IUser } from "../../models/user.model";
import { IAdmin } from "../../models/admin.model";

export interface IAdminService {
  login(email: string, rawPassword: string): Promise<IAdmin>;
  getAllUsers(): Promise<IUser[]>;
  getAllMentors(): Promise<IUser[]>;
  blockUser(id: string): Promise<IUser | null>;
  deleteUser(id: string): Promise<IUser | null>;
}
