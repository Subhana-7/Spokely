import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utilis/token";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";
import { ChangePasswordDTO } from "../dto/mentor.dto";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private _mentorService: IMentorService) {}

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorDTO = await this._mentorService.signup(req.body);
      if (!mentorDTO) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      res.status(STATUS_CODES.CREATED).json(mentorDTO);
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.login(req.body);
      if (!result) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.INVALID_CREDENTIALS });
        return;
      }

      const { mentor, accessToken, refreshToken } = result;

      res.cookie("auth-token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("role", mentor.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(STATUS_CODES.OK).json({ mentor });
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      await this._mentorService.sendOtp(req.body.email);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.OTP_SENT });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.verifyOtp(req.body.email, req.body.code);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentors = await this._mentorService.getAllMentors();
      res.status(STATUS_CODES.OK).json(mentors);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth-token");
    res.clearCookie("refresh-token");
    res.clearCookie("role");
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.LOGOUT });
  };

  updateMentorDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, documentUrl, textMessage } = req.body;
      const data = await this._mentorService.updateMentorDocument(email, documentUrl, textMessage);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.DOCUMENT_RESUBMITTED,
        data,
      });
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies["refresh-token"];
    if (!token) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.INVALID_TOKEN });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: "user" | "mentor";
      };

      if (payload.role !== "mentor") {
        res.status(STATUS_CODES.FORBIDDEN).json({ message: MESSAGES.ERROR.FORBIDDEN });
        return;
      }

      const mentor = await this._mentorService.getHome(payload.id);
      if (!mentor) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });

      res.cookie("auth-token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.TOKEN_REFRESHED, mentor });
    } catch (err) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.INVALID_TOKEN });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      if (!newPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.INVALID_INPUT });
        return;
      }

      await this._mentorService.forgotPassword(email, newPassword);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.PASSWORD_RESET_OTP_SENT });
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

  verifyForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._mentorService.verifyForgotPassword(req.body.email, req.body.code);
      res.status(STATUS_CODES.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

   home = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorId = (req as any).id || req.body?.id || req.params?.id;
      if (!mentorId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.INVALID_INPUT });
        return;
      }

      const dashboard = await this._mentorService.getHome(mentorId);
      if (!dashboard) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      res.status(STATUS_CODES.OK).json(dashboard);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      const mentor = await this._mentorService.getHome(req.params.id);
      if (!mentor) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json(mentor);
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  editMentor = async (req: Request, res: Response): Promise<void> => {
    try {
      const updateMentor = await this._mentorService.updateMentor(req.params.id, req.body);
      if (!updateMentor) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json(updateMentor);
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };


  changePassword = async(
      req:Request<{},{},ChangePasswordDTO>,
      res:Response
    ) => {
      try {
        await this._mentorService.changePassword(req.body);
        res
          .status(STATUS_CODES.OK)
          .json({ message: MESSAGES.SUCCESS.PASSWORD_CHANGED });
      } catch (error:any) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
      }
    }
}
