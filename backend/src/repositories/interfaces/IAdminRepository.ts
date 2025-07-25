import { IAdmin } from "../../models/admin.model";
import { IUser } from "../../models/user.model";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findAllUsers(): Promise<IUser[] | null>;
  findAllMentors(): Promise<IUser[] | null>;
  blockUser(id: string): Promise<IUser | null>;
  // deleteUser(id: string): Promise<IUser | null>;
}
