import { Request, Response } from "express";

export interface IAdminController {
  adminLogin(req: Request, res: Response): Promise<void>;
  listUsers(req: Request, res: Response): Promise<void>;
  listMentors(req: Request, res: Response): Promise<void>;
  blockUser(req: Request, res: Response): Promise<void>;
  // deleteUser(req: Request, res: Response): Promise<void>;
}
