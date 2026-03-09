import { CookieOptions, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utilis/token";
import { STATUS_CODES, MESSAGES, COOKIE_KEYS } from "../utilis/constants";
import { ChangePasswordDTO } from "../dto/mentor.dto";

@injectable()
export class MentorController implements IMentorController {
  constructor(
    @inject(TYPES.IMentorService) private _mentorService: IMentorService
  ) {}

  private getErrorMessage(
    err: unknown,
    fallback = MESSAGES.ERROR.SERVER_ERROR
  ) {
    return err instanceof Error ? err.message : fallback;
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorDTO = await this._mentorService.signup(req.body);

      if (!mentorDTO) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }

      res.status(STATUS_CODES.CREATED).json(mentorDTO);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.login(req.body);

      if (!result) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.INVALID_CREDENTIALS });
        return;
      }

      const { mentor, accessToken, refreshToken } = result;

      // const cookieOptions: CookieOptions = {
      //   httpOnly: false,
      //   secure: true,
      //   // sameSite: COOKIE_KEYS.SAME_SITE,
      //   sameSite: "lax",
      //   // path: COOKIE_KEYS.PATH,
      //   // domain: COOKIE_KEYS.DOMAIN,
      // };

      const cookieOptions: CookieOptions = {
        httpOnly: false,
        secure: true,
        sameSite: COOKIE_KEYS.SAME_SITE,
        path: COOKIE_KEYS.PATH,
        domain: COOKIE_KEYS.DOMAIN,
      };

      res.cookie(COOKIE_KEYS.AUTH, accessToken, cookieOptions);

      res.cookie(COOKIE_KEYS.REFRESH, refreshToken,cookieOptions);

      res.cookie(COOKIE_KEYS.ROLE, mentor.role, cookieOptions);

      res.status(STATUS_CODES.OK).json({ mentor });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      await this._mentorService.sendOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.OTP_SENT });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.verifyOtp(
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

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentors = await this._mentorService.getAllMentors();
      res.status(STATUS_CODES.OK).json(mentors);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie(COOKIE_KEYS.AUTH);
    res.clearCookie(COOKIE_KEYS.REFRESH);
    res.clearCookie(COOKIE_KEYS.ROLE);

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.SUCCESS.LOGOUT,
    });
  };

  updateMentorDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, documentUrl, textMessage } = req.body;

      const data = await this._mentorService.updateMentorDocument(
        email,
        documentUrl,
        textMessage
      );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.DOCUMENT_RESUBMITTED,
        data,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refresh = req.cookies[COOKIE_KEYS.REFRESH];

      if (!refresh) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
        return;
      }

      const result = await this._mentorService.refreshToken(refresh);

      // const cookieOptions: CookieOptions = {
      //   httpOnly: false,
      //   secure: true,
      //   // sameSite: COOKIE_KEYS.SAME_SITE,
      //   sameSite: "lax",
      //   // path: COOKIE_KEYS.PATH,
      //   // domain: COOKIE_KEYS.DOMAIN,
      // };

      const cookieOptions: CookieOptions = {
        httpOnly: false,
        secure: true,
        sameSite: COOKIE_KEYS.SAME_SITE,
        path: COOKIE_KEYS.PATH,
        domain: COOKIE_KEYS.DOMAIN,
      };

      res.cookie(COOKIE_KEYS.AUTH, result.accessToken,cookieOptions);

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.TOKEN_REFRESHED,
        mentor: result.mentor,
        accessToken: result.accessToken,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;

      if (!newPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.ERROR.INVALID_INPUT });
        return;
      }

      await this._mentorService.forgotPassword(email, newPassword);

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.PASSWORD_RESET_OTP_SENT });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  verifyForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.verifyForgotPassword(
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

  home = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorId = (req as any).id;
      const months = Number(req.query.months) || 6;

      if (!mentorId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
        return;
      }

      const dashboard = await this._mentorService.getHome(mentorId, months);

      if (!dashboard) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      res.status(STATUS_CODES.OK).json(dashboard);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorId = req.params.id;
      const months = 12;

      const mentor = await this._mentorService.getHome(mentorId, months);

      if (!mentor) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      res.status(STATUS_CODES.OK).json(mentor);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };

  editMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this._mentorService.updateMentor(
        req.params.id,
        req.body
      );

      if (!updated) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      res.status(STATUS_CODES.OK).json(updated);
    } catch (_err: unknown) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  changePassword = async (
    req: Request<{}, {}, ChangePasswordDTO>,
    res: Response
  ) => {
    try {
      await this._mentorService.changePassword(req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.PASSWORD_CHANGED });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: this.getErrorMessage(err),
      });
    }
  };
}
