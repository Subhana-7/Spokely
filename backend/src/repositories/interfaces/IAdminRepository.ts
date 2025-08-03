import { IAdmin } from "../../models/admin.model";
import { IUser } from "../../models/user.model";
import {IMentor} from "../../models/mentor.model"

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findAllUsers(): Promise<IUser[] | null>;
  findAllMentors(): Promise<IMentor[] | null>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
  // deleteUser(id: string): Promise<IUser | null>;
  getMentor(id:string):Promise<IMentor[] | null>;
  updateMentor(id:string):Promise<IMentor | null>;
  updateMentorRejection(id:string,reason:string):Promise<IMentor | null>;
  blockMentor(id: string): Promise<IUser | null>;
  unblockMentor(id: string): Promise<IUser | null>;
}
