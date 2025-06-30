import bcrypt from "bcrypt";
import { AdminRepository } from "../repositories/admin.repository";

export class AdminService {
  private repo = new AdminRepository();

  async login(email: string, rawPassword: string) {
    const admin = await this.repo.findByEmail(email);
    if (!admin) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(rawPassword, admin.password);
    if (!match) throw new Error("Invalid credentials");

    return admin;
  }
  async getAllUsers() {
    return this.repo.findAllUsers();
  }

  async getAllMentors() {
    return this.repo.findAllMentors();
  }
}
