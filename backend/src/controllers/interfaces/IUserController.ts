import { Request, Response } from "express";

export interface IUserController {
  signup(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  sendOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  home(req: Request, res: Response): Promise<void>;
  updateRole(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  handleGoogleAccounts(req: Request, res: Response, next: Function): Promise<void>;
  googleCallback(req: Request, res: Response, next: Function): Promise<void>;
  
  // New methods for forgot password
  forgotPassword(req: Request, res: Response): Promise<void>;
  verifyForgotPassword(req: Request, res: Response): Promise<void>;
}