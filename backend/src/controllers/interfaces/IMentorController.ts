import { Request, Response } from "express";

export interface IMentorController {
  signup(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  sendOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  getAll(req: Request, res: Response): Promise<void>;
  updateMentorDocument(req:Request,res:Response):Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>
}
