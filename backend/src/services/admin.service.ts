import bcrypt from "bcrypt";
import { AdminRepository } from "../repositories/admin.repository";
import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { inject,injectable } from "inversify";
import {TYPES} from '../types/types'
import { IAdminService } from "./interfaces/IAdminService";
import User,{ IUser } from "../models/user.model";
import { IAdmin } from "../models/admin.model";


@injectable()
export class AdminService implements IAdminService {
  constructor(@inject(TYPES.IAdminRepository) private repo: IAdminRepository) {}

  async login(email: string, rawPassword: string): Promise<Partial<IAdmin> | null> {
    const admin = await this.repo.findByEmail(email);
    if (!admin) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(rawPassword, admin.password);
    if (!match) throw new Error("Invalid credentials");

    return admin;
  }
  async getAllUsers(): Promise<Partial<IUser>[] | null> {
    return this.repo.findAllUsers();
  }

  async getAllMentors(): Promise<Partial<IUser>[] | null> {
    return this.repo.findAllMentors();
  }

  async blockUser(id: string): Promise<IUser | null> {
    return this.repo.blockUser(id);
  }

  async deleteUser(id: string): Promise<IUser | null> {
    return this.repo.deleteUser(id);
  }
}
