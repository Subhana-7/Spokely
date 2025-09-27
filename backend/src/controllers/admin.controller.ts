import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { generateAccessToken } from "../utilis/token";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.IAdminService) private _adminService: IAdminService
  ) {}

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this._adminService.login(email, password);

      if (!result) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ error: MESSAGES.ERROR.INVALID_CREDENTIALS });
        return;
      }

      const { admin, accessToken, refreshToken } = result;

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
      res.cookie("role", admin.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.LOGIN, admin });
    } catch (err: any) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: err.message || MESSAGES.ERROR.INVALID_CREDENTIALS });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.params;
      const { status } = req.body;
      const result = await this._adminService.updateUserStatus(userId, status);
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.ROLE_UPDATED, result });
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.ERROR.INVALID_INPUT });
    }
  }

  async updateMentorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: mentorId } = req.params;
      const { status } = req.body;
      const result = await this._adminService.updateMentorStatus(
        mentorId,
        status
      );
      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.ROLE_UPDATED, result });
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.ERROR.INVALID_INPUT });
    }
  }

  async mentorVerification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this._adminService.getMentor(id);
      res.status(STATUS_CODES.OK).json(data);
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async approveMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this._adminService.approveMentor(id);
      res.status(STATUS_CODES.OK).json(data);
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async rejectMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const data = await this._adminService.rejectMentor(id, rejectionReason);
      res.status(STATUS_CODES.OK).json(data);
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getAllUsersWithQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        level: req.query.level as string,
        minSessions: req.query.minSessions ? +req.query.minSessions : undefined,
        maxSessions: req.query.maxSessions ? +req.query.maxSessions : undefined,
        minMentors: req.query.minMentors ? +req.query.minMentors : undefined,
        maxMentors: req.query.maxMentors ? +req.query.maxMentors : undefined,
        isBlocked:
          req.query.isBlocked === "true"
            ? true
            : req.query.isBlocked === "false"
            ? false
            : undefined,
      });

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.USER_FETCHED, result });
    } catch (err: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: err.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getAllMentorsWithQuery({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || "",
        sortBy: req.query.sortBy as "students" | "sessions",
        verificationStatus: req.query.verificationStatus as
          | "pending"
          | "approved"
          | "rejected",
        isBlocked:
          req.query.isBlocked === "true"
            ? true
            : req.query.isBlocked === "false"
            ? false
            : undefined,
      });

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.USER_FETCHED, result });
    } catch (err: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: err.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async home(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const admin = await this._adminService.getHome(id);

      if (!admin) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      res.status(STATUS_CODES.OK).json(admin);
    } catch (error: any) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: error.message || MESSAGES.ERROR.SERVER_ERROR });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies["refresh-token"];
    if (!token) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: "user" | "mentor" | "admin";
      };

      if (payload.role !== "admin") {
        res
          .status(STATUS_CODES.FORBIDDEN)
          .json({ message: MESSAGES.ERROR.FORBIDDEN });
        return;
      }

      const result = await this._adminService.getHome(payload.id);
      if (!result) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }

      const newAccessToken = generateAccessToken({
        id: payload.id,
        role: payload.role,
      });

      res.cookie("auth-token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res
        .status(STATUS_CODES.OK)
        .json({ message: "Token refreshed", user: result });
    } catch (error) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("role", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.SUCCESS.LOGOUT });
  }

  getAllSessionsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      mentorId: req.query.mentorId as string,
    };

    const sessions = await this._adminService.getAllSessionsAdmin(filters);

    if (!sessions || sessions.length === 0) {
      res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.SESSION.NOT_FOUND });
      return;
    }

    res.status(STATUS_CODES.OK).json({
      sessions,
      total: sessions.length,
    });
  } catch (err: any) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

}
