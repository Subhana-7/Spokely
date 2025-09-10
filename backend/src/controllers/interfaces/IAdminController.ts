import { Request, Response } from "express";

export interface IAdminController {
  adminLogin(req: Request, res: Response): Promise<void>;
  listUsers(req: Request, res: Response): Promise<void>;
  listMentors(req: Request, res: Response): Promise<void>;
  updateUserStatus(req: Request, res: Response): Promise<void>;
  mentorVerification(req: Request, res: Response): Promise<void>;
  approveMentor(req: Request, res: Response): Promise<void>;
  rejectMentor(req: Request, res: Response): Promise<void>;
  updateMentorStatus(req: Request, res: Response): Promise<void>;
  home(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}