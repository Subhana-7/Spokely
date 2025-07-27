import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminService } from "../services/admin.service";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { mapUserToSummaryDto } from "../mappers/admin.mapper";

export class AdminController implements IAdminController {
  constructor(@inject(TYPES.IAdminService) private service: IAdminService) {
    this.adminLogin = this.adminLogin.bind(this);
    this.listUsers = this.listUsers.bind(this);
    this.listMentors = this.listMentors.bind(this);
    this.blockUser = this.blockUser.bind(this);
    // this.deleteUser = this.deleteUser.bind(this);
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const admin = await this.service.login(email, password);

      if (!admin) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.status(200).json({ token });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.service.getAllUsers();
      const usersDto = users?.map(mapUserToSummaryDto);
      res.status(200).json(usersDto);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const mentors = await this.service.getAllMentors();
      res.status(200).json(mentors);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await this.service.blockUser(id);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // async deleteUser(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("controller - delete");
  //     const { id } = req.params;
  //     await this.service.deleteUser(id);
  //     res.status(200).json({ message: "User deleted" });
  //   } catch (err: any) {
  //     res.status(500).json({ error: err.message });
  //   }
  // }
}
