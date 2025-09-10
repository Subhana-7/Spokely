import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserService } from "../services/interfaces/IUserService";
import {
  SignupDTO,
  LoginDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  ForgotPasswordDTO,
  VerifyForgotPasswordDTO,
  UpdateRoleDTO,
} from "../dto/user.dto";
import { IUserController } from "./interfaces/IUserController";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.IUserService) private service: IUserService) {}

  signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
    try {
      const user = await this.service.signup(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    try {
      const result = await this.service.login(req.body);
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.cookie("refresh-token", result.refreshToken, { httpOnly: true });
      res.cookie("role", result.user.role, { httpOnly: false });
      res.status(200).json({ user: result.user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(200).json({ message: "Logged out successfully" });
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const result = await this.service.refreshToken(
        req.cookies["refresh-token"]
      );
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.status(200).json({ user: result.user });
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  };

  handleGoogleAccounts = async (
    req: Request,
    res: Response,
    next: Function
  ) => {
    // delegate to passport or middleware
    next();
  };

  googleCallback = async (req: Request, res: Response, next: Function) => {
    // delegate to passport callback
    next();
  };

  home = async (req: Request, res: Response) => {
    try {
      const user = await this.service.getHome(req.params.id);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  sendOtp = async (req: Request<{}, {}, SendOtpDTO>, res: Response) => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(200).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request<{}, {}, VerifyOtpDTO>, res: Response) => {
    try {
      const result = await this.service.verifyOtp(
        req.body.email,
        req.body.code
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      await this.service.forgotPassword(req.body);
      res.status(200).json({ message: "Password reset OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  verifyForgotPassword = async (
    req: Request<{}, {}, VerifyForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      const result = await this.service.verifyForgotPassword(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateRole = async (req: Request<{}, {}, UpdateRoleDTO>, res: Response) => {
    try {
      const user = await this.service.updateRole(
        (req as any).userId,
        req.body.role
      );
      res.status(200).json({ message: "Role updated", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this.service.getAllUsers();
      res.status(200).json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const user = await this.service.getHome(req.params.id);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  editUser = async (req: Request, res: Response) => {
    try {
      const user = await this.service.updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
