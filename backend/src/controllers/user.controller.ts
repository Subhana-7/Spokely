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
  changePasswordDTO
} from "../dto/user.dto";
import { IUserController } from "./interfaces/IUserController";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class UserController implements IUserController { 
  constructor(@inject(TYPES.IUserService) private _userService: IUserService) {}

  signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
    try {
      const user = await this._userService.signup(req.body);
      res.status(STATUS_CODES.CREATED).json(user);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    try {
      const result = await this._userService.login(req.body);
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.cookie("refresh-token", result.refreshToken, { httpOnly: true });
      res.cookie("role", result.user.role, { httpOnly: false });
      res.status(STATUS_CODES.OK).json({ user: result.user });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.LOGOUT });
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const result = await this._userService.refreshToken(
        req.cookies["refresh-token"]
      );
      res.cookie("auth-token", result.accessToken, { httpOnly: true });
      res.status(STATUS_CODES.OK).json({ user: result.user });
    } catch (err: any) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: err.message });
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
      const user = await this._userService.getHome(req.params.id);
      res.status(STATUS_CODES.OK).json(user);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  sendOtp = async (req: Request<{}, {}, SendOtpDTO>, res: Response) => {
    try {
      await this._userService.sendOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.OTP_SENT });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request<{}, {}, VerifyOtpDTO>, res: Response) => {
    try {
      const result = await this._userService.verifyOtp(
        req.body.email,
        req.body.code
      );
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      await this._userService.forgotPassword(req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.OTP_SENT });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyForgotPassword = async (
    req: Request<{}, {}, VerifyForgotPasswordDTO>,
    res: Response
  ) => {
    try {
      const result = await this._userService.verifyForgotPassword(req.body);
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  updateRole = async (req: Request<{}, {}, UpdateRoleDTO>, res: Response) => {
    try {
      const user = await this._userService.updateRole(
        (req as any).userId,
        req.body.role
      );
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.ROLE_UPDATED, user });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this._userService.getAllUsers();
      res.status(STATUS_CODES.OK).json(users);
    } catch (err: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const user = await this._userService.getHome(req.params.id);
      res.status(STATUS_CODES.OK).json(user);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  editUser = async (req: Request, res: Response) => {
    try {
      const user = await this._userService.updateUser(req.params.id, req.body);
      res.status(STATUS_CODES.OK).json(user);
    } catch (err: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };

  changePassword = async(
    req:Request<{},{},changePasswordDTO>,
    res:Response
  ) => {
    try {
      await this._userService.changePassword(req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.PASSWORD_CHANGED });
    } catch (error:any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  }
}
