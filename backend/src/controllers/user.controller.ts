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
import { StatusCode } from "../utilis/status.code";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.IUserService) private service: IUserService) {}

  signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
    try {
      const user = await this.service.signup(req.body);
      res.status(StatusCode.CREATED).json(user);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    try {
      const result = await this.service.login(req.body);
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.cookie("refresh-token", result.refreshToken, { httpOnly: true });
      res.cookie("role", result.user.role, { httpOnly: false });
      res.status(StatusCode.OK).json({ user: result.user });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(StatusCode.OK).json({ message: "Logged out successfully" });
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const result = await this.service.refreshToken(
        req.cookies["refresh-token"]
      );
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.status(StatusCode.OK).json({ user: result.user });
    } catch (err: any) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: err.message });
    }
  };

  handleGoogleAccounts = async (
    req: Request,
    res: Response,
    next: Function
  ) => {
    next();
  };

  googleCallback = async (req: Request, res: Response, next: Function) => {
    next();
  };

  home = async (req: Request, res: Response) => {
    try {
      const user = await this.service.getHome(req.params.id);
      res.status(StatusCode.OK).json(user);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  sendOtp = async (req: Request<{}, {}, SendOtpDTO>, res: Response) => {
    try {
      await this.service.sendOtp(req.body.email);
      res.status(StatusCode.OK).json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request<{}, {}, VerifyOtpDTO>, res: Response) => {
    try {
      const result = await this.service.verifyOtp(
        req.body.email,
        req.body.code
      );
      res.status(StatusCode.OK).json(result);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      await this.service.forgotPassword(req.body);
      res
        .status(StatusCode.OK)
        .json({ message: "Password reset OTP sent to email" });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyForgotPassword = async (
    req: Request<{}, {}, VerifyForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      const result = await this.service.verifyForgotPassword(req.body);
      res.status(StatusCode.OK).json(result);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  updateRole = async (req: Request<{}, {}, UpdateRoleDTO>, res: Response) => {
    try {
      const user = await this.service.updateRole(
        (req as any).userId,
        req.body.role
      );
      res.status(StatusCode.OK).json({ message: "Role updated", user });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this.service.getAllUsers();
      res.status(StatusCode.OK).json(users);
    } catch (err: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const user = await this.service.getHome(req.params.id);
      res.status(StatusCode.OK).json(user);
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  editUser = async (req: Request, res: Response) => {
    try {
      const user = await this.service.updateUser(req.params.id, req.body);
      res.status(StatusCode.OK).json(user);
    } catch (err: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };
}
