import { IUser } from "../../models/user.model";
import { IAdmin } from "../../models/admin.model";

export interface IAdminService {
  login(email: string, rawPassword: string): Promise< Partial<IAdmin> | null>;
  getAllUsers(): Promise<Partial<IUser>[] | null>;
  getAllMentors(): Promise<Partial<IUser>[] | null>;
  blockUser(id: string): Promise<IUser | null>;
  deleteUser(id: string): Promise<IUser | null>;
}
