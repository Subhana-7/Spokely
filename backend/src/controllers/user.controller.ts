import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserService } from "../services/interfaces/IUserService";
import {
  SignupDTO,
  LoginDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  SendForgotPasswordOtpDTO,
  VerifyForgotPasswordOtpDTO,
  ResetPasswordDTO,
  UpdateRoleDTO,
  changePasswordDTO,
} from "../dto/user.dto";
import { IUserController } from "./interfaces/IUserController";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";

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
      const refresh = req.cookies["refresh-token"];
      const result = await this._userService.refreshToken(refresh);

      res.cookie("auth-token", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(200).json({
        message: "Access token refreshed",
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err: any) {
      return res
        .status(401)
        .json({ message: err.message || "Refresh token invalid" });
    }
  };

  handleGoogleAccounts = async (
    req: Request,
    res: Response,
    next: Function
  ) => {
    console.log("Initiating Google OAuth...");
    next();
  };

  googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        console.error("No user found in req.user after Google auth");
        return res.redirect(
          `${
            process.env.CLIENT_SIDE_URL || "http://localhost:5173"
          }/?error=google_auth_failed`
        );
      }

      const accessToken = generateAccessToken({
        id: user._id,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({
        id: user._id,
        role: user.role,
      });

      res
        .cookie("auth-token", accessToken, { httpOnly: true })
        .cookie("refresh-token", refreshToken, { httpOnly: true })
        .cookie("role", user.role, { httpOnly: false })
        .redirect(
          `${process.env.CLIENT_SIDE_URL || "http://localhost:5173"}/user/home`
        );
    } catch (error: any) {
      console.error("Google callback error:", error);
      return res.redirect(
        `${
          process.env.CLIENT_SIDE_URL || "http://localhost:5173"
        }/?error=google_auth_failed`
      );
    }
  };

  home = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      const data = await this._userService.getHome(userId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
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

  sendForgotPasswordOtp = async (
    req: Request<{}, {}, SendForgotPasswordOtpDTO>,
    res: Response
  ) => {
    try {
      await this._userService.sendForgotPasswordOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.OTP_SENT });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyForgotPasswordOtp = async (
    req: Request<{}, {}, VerifyForgotPasswordOtpDTO>,
    res: Response
  ) => {
    try {
      const result = await this._userService.verifyForgotPasswordOtp(
        req.body.email,
        req.body.code
      );
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  resetPassword = async (
    req: Request<{}, {}, ResetPasswordDTO>,
    res: Response
  ) => {
    try {
      await this._userService.resetPassword(
        req.body.email,
        req.body.newPassword
      );
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.PASSWORD_CHANGED });
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
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = await this._userService.getHome(userId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  };

  editUser = async (req: Request, res: Response) => {
    try {
      const user = await this._userService.updateUser(req.params.id, req.body);
      res.status(STATUS_CODES.OK).json(user);
    } catch (err: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    }
  };

  changePassword = async (
    req: Request<{}, {}, changePasswordDTO>,
    res: Response
  ) => {
    try {
      await this._userService.changePassword(req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.PASSWORD_CHANGED });
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  mentorListing = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await this._userService.listMentors({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
      });

      res.status(200).json({
        message: "Mentor listing fetched successfully",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
