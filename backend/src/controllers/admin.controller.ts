import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { generateAccessToken } from "../utilis/token";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";
import { IPaymentService } from "../services/interfaces/IPaymentService";
import { IDailyTaskService } from "../services/interfaces/IDailyTaskService";
import { ISessionService } from "../services/interfaces/ISessionService";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IUserService } from "../services/interfaces/IUserService";

export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.IAdminService) private _adminService: IAdminService,
    @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.IDailyTaskService)
    private _dailyTaskService: IDailyTaskService,
    @inject(TYPES.ISessionService) private _sessionService: ISessionService,
    @inject(TYPES.IMentorService) private _mentorService: IMentorService,
    @inject(TYPES.IUserService) private _userService: IUserService
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
    const stats = await this._adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (error: any) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load admin dashboard stats",
    });
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

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.LOGOUT });
  }

 getAllSessionsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "all";

    const result = await this._adminService.getAllSessionsAdmin({
      page,
      limit,
      search,
      status,
    });

    res.status(200).json({
      sessions: result.sessions,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (err: any) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


  getAllPayments = async (req: any, res: Response) => {
    try {
      const payments = await this._paymentService.getAllPayments();
      res.status(STATUS_CODES.OK).json({ data: payments });
    } catch (error: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  getPaymentById = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const payment = await this._paymentService.getPaymentById(id);
      if (!payment) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.ERROR.NOT_FOUND });
      }
      res.status(STATUS_CODES.OK).json({ data: payment });
    } catch (error: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  };

  async listAllDailyTasks(req: Request, res: Response) {
    try {
      const tasks = await this._dailyTaskService.getAllUsersLatestTasks();
      res.status(200).json({ tasks });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate, status, mentorId } = req.query;

      const validTypes = ["session", "mentor", "user", "dailyTask", "payment"];
      if (!type || !validTypes.includes(type as string)) {
        res.status(400).json({
          message:
            "Invalid type. Must be one of: session, mentor, user, dailyTask, payment",
        });
        return;
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      let data: any[] = [];

      switch (type) {
        case "session":
          data =
            (await this._sessionService.getAllSessionsAdmin({
              status: status as string,
              mentorId: mentorId as string,
            })) || [];
          break;

        case "mentor":
          data = (await this._mentorService.getAllMentors()) || [];
          break;

        case "user":
          data = (await this._userService.getAllUsers()) || [];
          break;

        case "dailyTask":
          data = (await this._dailyTaskService.getAllUsersLatestTasks()) || [];
          break;

        case "payment":
          data = (await this._paymentService.getAllPayments()) || [];
          break;
      }

      if (start || end) {
        data = data.filter((item: any) => {
          const dateField =
            item.createdAt || item.updatedAt || item.date || item.timestamp;
          if (!dateField) return true;
          const d = new Date(dateField);
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      }

      res.status(200).json({
        success: true,
        type,
        count: data.length,
        data,
      });
    } catch (error: any) {
      console.error("Error in getReports:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate report",
        error: error.message,
      });
    }
  }
}
