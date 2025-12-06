import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IUserService } from "../services/interfaces/IUserService";
import type { CookieOptions } from "express";

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

import {
  STATUS_CODES,
  MESSAGES,
  COOKIE_KEYS,
  GOOGLE_AUTH_MESSAGES,
  REDIRECT_URLS,
  USER_MESSAGES,
  USER_QUERY,
} from "../utilis/constants";

import { generateAccessToken, generateRefreshToken } from "../utilis/token";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.IUserService) private _userService: IUserService) {}

  private getErrorMessage(
    err: unknown,
    fallback = MESSAGES.ERROR.SERVER_ERROR
  ) {
    return err instanceof Error ? err.message : fallback;
  }

  /* ----------------------------------------------------
      SIGNUP
  ----------------------------------------------------- */
  signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
    try {
      const user = await this._userService.signup(req.body);
      res.status(STATUS_CODES.CREATED).json(user);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      LOGIN
  ----------------------------------------------------- */
  login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    try {
      const result = await this._userService.login(req.body);

      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".spokely.vercel.app",
      };

      res.cookie(COOKIE_KEYS.AUTH, result.accessToken, cookieOptions);
      res.cookie(COOKIE_KEYS.REFRESH, result.refreshToken, cookieOptions);
      res.cookie(COOKIE_KEYS.ROLE, result.user.role, {
        secure: true,
        sameSite: "none" as const,
        domain: ".spokely.vercel.app",
      });

      res.status(STATUS_CODES.OK).json({ user: result.user });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      LOGOUT
  ----------------------------------------------------- */
  logout = async (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_KEYS.AUTH);
    res.clearCookie(COOKIE_KEYS.REFRESH);
    res.clearCookie(COOKIE_KEYS.ROLE);

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.SUCCESS.LOGOUT,
    });
  };

  /* ----------------------------------------------------
      REFRESH TOKEN
  ----------------------------------------------------- */
  refreshToken = async (req: Request, res: Response) => {
    try {
      const refresh = req.cookies[COOKIE_KEYS.REFRESH];

      const result = await this._userService.refreshToken(refresh);

      res.cookie(COOKIE_KEYS.AUTH, result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".spokely.vercel.app",
        path: "/",
      });

      return res.status(STATUS_CODES.OK).json({
        message: USER_MESSAGES.TOKEN_REFRESHED,
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: this.getErrorMessage(err, MESSAGES.ERROR.INVALID_TOKEN),
      });
    }
  };

  /* ----------------------------------------------------
      GOOGLE OAUTH START
  ----------------------------------------------------- */
  handleGoogleAccounts = async (
    _req: Request,
    _res: Response,
    next: Function
  ) => {
    console.log(GOOGLE_AUTH_MESSAGES.ERROR_NO_USER);
    next();
  };

  /* ----------------------------------------------------
      GOOGLE CALLBACK
  ----------------------------------------------------- */
  googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;

      if (!user) {
        console.error(GOOGLE_AUTH_MESSAGES.ERROR_NO_USER);
        return res.redirect(
          `${REDIRECT_URLS.DEFAULT_CLIENT}/?${REDIRECT_URLS.GOOGLE_AUTH_FAILED}`
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
        .cookie(COOKIE_KEYS.AUTH, accessToken, { httpOnly: true })
        .cookie(COOKIE_KEYS.REFRESH, refreshToken, { httpOnly: true })
        .cookie(COOKIE_KEYS.ROLE, user.role)
        .redirect(`${REDIRECT_URLS.DEFAULT_CLIENT}${REDIRECT_URLS.USER_HOME}`);
    } catch (err: unknown) {
      console.error(GOOGLE_AUTH_MESSAGES.ERROR_AUTH_FAILED, err);
      return res.redirect(
        `${REDIRECT_URLS.DEFAULT_CLIENT}/?${REDIRECT_URLS.GOOGLE_AUTH_FAILED}`
      );
    }
  };

  /* ----------------------------------------------------
      USER HOME
  ----------------------------------------------------- */
  home = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).id;
      const data = await this._userService.getHome(userId);

      return res.status(STATUS_CODES.OK).json(data);
    } catch (err: unknown) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      SEND OTP
  ----------------------------------------------------- */
  sendOtp = async (req: Request<{}, {}, SendOtpDTO>, res: Response) => {
    try {
      await this._userService.sendOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.OTP_SENT,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      VERIFY OTP
  ----------------------------------------------------- */
  verifyOtp = async (req: Request<{}, {}, VerifyOtpDTO>, res: Response) => {
    try {
      const result = await this._userService.verifyOtp(
        req.body.email,
        req.body.code
      );

      res.status(STATUS_CODES.OK).json(result);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      FORGOT PASSWORD OTP
  ----------------------------------------------------- */
  sendForgotPasswordOtp = async (
    req: Request<{}, {}, SendForgotPasswordOtpDTO>,
    res: Response
  ) => {
    try {
      await this._userService.sendForgotPasswordOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.OTP_SENT,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      VERIFY FORGOT PASSWORD OTP
  ----------------------------------------------------- */
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      RESET PASSWORD
  ----------------------------------------------------- */
  resetPassword = async (
    req: Request<{}, {}, ResetPasswordDTO>,
    res: Response
  ) => {
    try {
      await this._userService.resetPassword(
        req.body.email,
        req.body.newPassword
      );

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.PASSWORD_CHANGED,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      UPDATE ROLE
  ----------------------------------------------------- */
  updateRole = async (req: Request<{}, {}, UpdateRoleDTO>, res: Response) => {
    try {
      const user = await this._userService.updateRole(
        (req as any).userId,
        req.body.role
      );

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.ROLE_UPDATED,
        user,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      LIST ALL USERS
  ----------------------------------------------------- */
  getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await this._userService.getAllUsers();

      res.status(STATUS_CODES.OK).json(users);
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      PROFILE
  ----------------------------------------------------- */
  profile = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      console.log(userId);
      const data = await this._userService.getHome(userId);

      return res.status(STATUS_CODES.OK).json(data);
    } catch (err: unknown) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      EDIT USER
  ----------------------------------------------------- */
  editUser = async (req: Request, res: Response) => {
    try {
      const user = await this._userService.updateUser(req.params.id, req.body);

      res.status(STATUS_CODES.OK).json(user);
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      CHANGE PASSWORD
  ----------------------------------------------------- */
  changePassword = async (
    req: Request<{}, {}, changePasswordDTO>,
    res: Response
  ) => {
    try {
      await this._userService.changePassword(req.body);

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.PASSWORD_CHANGED,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  /* ----------------------------------------------------
      MENTOR LISTING
  ----------------------------------------------------- */
  mentorListing = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || USER_QUERY.PAGE;
      const limit = Number(req.query.limit) || USER_QUERY.LIMIT;
      const search = String(req.query.search || USER_QUERY.SEARCH);

      const result = await this._userService.listMentors({
        page,
        limit,
        search,
      });

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.MENTOR_FETCHED,
        ...result,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };
}
