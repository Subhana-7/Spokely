import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAdminController } from "./interfaces/IAdminController";
import { IAdminService } from "../services/interfaces/IAdminService";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { generateAccessToken } from "../utilis/token";

import {
  STATUS_CODES,
  MESSAGES,
  ADMIN_MESSAGES,
  COOKIE_KEYS,
  ADMIN_QUERY,
  REPORT_TYPES,
  REPORT_TYPE_LIST,
  ReportType,
  LOG_STRINGS,
  ROLES,
  VERIFICATION_STATUS,
} from "../utilis/constants";

import { IPaymentService } from "../services/interfaces/IPaymentService";
import { IDailyTaskService } from "../services/interfaces/IDailyTaskService";
import { ISessionService } from "../services/interfaces/ISessionService";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IUserService } from "../services/interfaces/IUserService";

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

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

  /* ----------------------------------------------------
      ADMIN LOGIN
  ----------------------------------------------------- */
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

      const cookieOptions: CookieOptions = {
        httpOnly: false,
        secure: true,
        sameSite: COOKIE_KEYS.SAME_SITE,
        // sameSite: 'lax',
        path: COOKIE_KEYS.PATH,
        // domain: COOKIE_KEYS.DOMAIN,
      };

      res.cookie(COOKIE_KEYS.AUTH, accessToken, cookieOptions);

      res.cookie(COOKIE_KEYS.REFRESH, refreshToken,cookieOptions);

      res.cookie(COOKIE_KEYS.ROLE, admin.role, cookieOptions);

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.LOGIN, admin });
    } catch (err: unknown) {
      const message = getErrorMessage(err, MESSAGES.ERROR.INVALID_CREDENTIALS);
      res.status(STATUS_CODES.UNAUTHORIZED).json({ error: message });
    }
  }

  /* ----------------------------------------------------
      UPDATE USER STATUS
  ----------------------------------------------------- */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.params;
      const { status } = req.body;

      const result = await this._adminService.updateUserStatus(userId, status);

      res
        .status(STATUS_CODES.OK)
        .json({ message: MESSAGES.SUCCESS.ROLE_UPDATED, result });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        error: getErrorMessage(err, MESSAGES.ERROR.INVALID_INPUT),
      });
    }
  }

  /* ----------------------------------------------------
      UPDATE MENTOR STATUS
  ----------------------------------------------------- */
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        error: getErrorMessage(err, MESSAGES.ERROR.INVALID_INPUT),
      });
    }
  }

  /* ----------------------------------------------------
      MENTOR VERIFICATION
  ----------------------------------------------------- */
  async mentorVerification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this._adminService.getMentor(id);

      res.status(STATUS_CODES.OK).json(data);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  /* ----------------------------------------------------
      APPROVE / REJECT MENTOR
  ----------------------------------------------------- */
  async approveMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this._adminService.approveMentor(id);

      res.status(STATUS_CODES.OK).json(data);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  async rejectMentor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const data = await this._adminService.rejectMentor(id, rejectionReason);

      res.status(STATUS_CODES.OK).json(data);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  /* ----------------------------------------------------
      LIST USERS
  ----------------------------------------------------- */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getAllUsersWithQuery({
        page: parseInt(req.query.page as string) || ADMIN_QUERY.PAGE,
        limit: parseInt(req.query.limit as string) || ADMIN_QUERY.LIMIT,
        search: (req.query.search as string) || ADMIN_QUERY.SEARCH,
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  /* ----------------------------------------------------
      LIST MENTORS
  ----------------------------------------------------- */
  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getAllMentorsWithQuery({
        page: parseInt(req.query.page as string) || ADMIN_QUERY.PAGE,
        limit: parseInt(req.query.limit as string) || ADMIN_QUERY.LIMIT,
        search: (req.query.search as string) || ADMIN_QUERY.SEARCH,
        sortBy: req.query.sortBy as "students" | "sessions",
        verificationStatus: req.query.verificationStatus as
          | (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS]
          | undefined,
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  /* ----------------------------------------------------
      HOME DASHBOARD
  ----------------------------------------------------- */
  async home(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this._adminService.getDashboardStats();

      res.status(STATUS_CODES.OK).json({
        success: true,
        ...stats,
      });
    } catch (err: unknown) {
      console.error(LOG_STRINGS.DASHBOARD_ERROR, err);

      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(
          err,
          ADMIN_MESSAGES.ERROR.DASHBOARD_LOAD_FAILED
        ),
      });
    }
  }

  /* ----------------------------------------------------
      REFRESH TOKEN
  ----------------------------------------------------- */
  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies[COOKIE_KEYS.REFRESH];

    if (!token) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as {
        id: string;
        role: (typeof ROLES)[keyof typeof ROLES];
      };

      if (payload.role !== ROLES.ADMIN) {
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

      const cookieOptions: CookieOptions = {
        httpOnly: false,
        secure: true,
        sameSite: COOKIE_KEYS.SAME_SITE,
        // sameSite: 'lax',
        path: COOKIE_KEYS.PATH,
        // domain: COOKIE_KEYS.DOMAIN,
      };

      res.cookie(COOKIE_KEYS.AUTH, newAccessToken, cookieOptions);

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.SUCCESS.TOKEN_REFRESHED,
        user: result,
      });
    } catch (_err: unknown) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.ERROR.INVALID_TOKEN });
    }
  }

  /* ----------------------------------------------------
      LOGOUT
  ----------------------------------------------------- */
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE_KEYS.AUTH, {
      httpOnly: true,
      secure: process.env.NODE_ENV === COOKIE_KEYS.NODE_ENV,
      sameSite: COOKIE_KEYS.SAME_SITE,
    });

    res.clearCookie(COOKIE_KEYS.REFRESH, {
      httpOnly: true,
      secure: process.env.NODE_ENV === COOKIE_KEYS.NODE_ENV,
      sameSite: COOKIE_KEYS.SAME_SITE,
    });

    res.clearCookie(COOKIE_KEYS.ROLE, {
      httpOnly: false,
      secure: process.env.NODE_ENV === COOKIE_KEYS.NODE_ENV,
      sameSite: COOKIE_KEYS.SAME_SITE,
    });

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.SUCCESS.LOGOUT,
    });
  }

  /* ----------------------------------------------------
      ADMIN - GET ALL SESSIONS
  ----------------------------------------------------- */
  getAllSessionsAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || ADMIN_QUERY.PAGE;
      const limit = parseInt(req.query.limit as string) || ADMIN_QUERY.LIMIT;
      const search = (req.query.search as string) || ADMIN_QUERY.SEARCH;
      const status = (req.query.status as string) || ADMIN_QUERY.STATUS_ALL;

      const type = (req.query.type as string) || ADMIN_QUERY.TYPE;

      const result = await this._adminService.getAllSessionsAdmin({
        page,
        limit,
        search,
        status,
        type,
      });

      res.status(STATUS_CODES.OK).json({
        sessions: result.sessions,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        type,
      });
    } catch (err: unknown) {
      console.error(ADMIN_MESSAGES.ERROR.SESSION_FETCH_FAILED, err);

      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: getErrorMessage(
          err,
          ADMIN_MESSAGES.ERROR.SESSION_FETCH_FAILED
        ),
      });
    }
  };

  /* ----------------------------------------------------
      ADMIN - ALL PAYMENTS
  ----------------------------------------------------- */
  getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await this._paymentService.getAllPayments();
      res.status(STATUS_CODES.OK).json({ data: payments });
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  };

  /* ----------------------------------------------------
      PAYMENT BY ID
  ----------------------------------------------------- */
  getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this._paymentService.getPaymentById(id);

      if (!payment) {
        res.status(STATUS_CODES.NOT_FOUND).json({
          message: MESSAGES.ERROR.NOT_FOUND,
        });
        return;
      }

      res.status(STATUS_CODES.OK).json({ data: payment });
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  };

  /* ----------------------------------------------------
      ALL DAILY TASKS
  ----------------------------------------------------- */
  async listAllDailyTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this._dailyTaskService.getAllUsersLatestTasks();
      res.status(STATUS_CODES.OK).json({ tasks });
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  async getDailyTaskById(req: Request, res: Response): Promise<void> {
    try {
      const dailyTaskId = req.params.id;
      const task = await this._dailyTaskService.getDailyTaskById(dailyTaskId);
      res.status(STATUS_CODES.OK).json({ task });
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  /* ----------------------------------------------------
      ADMIN REPORTS
  ----------------------------------------------------- */
  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate } = req.query;

      const reportType = type as ReportType;

      if (!type || !REPORT_TYPE_LIST.includes(reportType)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: ADMIN_MESSAGES.ERROR.INVALID_REPORT_TYPE,
        });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      let data: any[] = [];

      switch (reportType) {
        case REPORT_TYPES.SESSION:
          data = (await this._sessionService.getAllSessionsAdmin()) || [];
          break;

        case REPORT_TYPES.MENTOR:
          data = (await this._mentorService.getAllMentors()) || [];
          break;

        case REPORT_TYPES.USER:
          data = (await this._userService.getAllUsers()) || [];
          break;

        case REPORT_TYPES.DAILY_TASK:
          data = (await this._dailyTaskService.getAllUsersLatestTasks()) || [];
          break;

        case REPORT_TYPES.PAYMENT:
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

      res.status(STATUS_CODES.OK).json({
        success: true,
        type: reportType,
        count: data.length,
        data,
      });
    } catch (err: unknown) {
      console.error(LOG_STRINGS.REPORT_ERROR, err);

      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ADMIN_MESSAGES.ERROR.REPORT_GENERATION_FAILED,
        error: getErrorMessage(err, MESSAGES.ERROR.SERVER_ERROR),
      });
    }
  }

  async downloadReportPdf(req: Request, res: Response): Promise<void> {
    try {
      const params = {
        type: req.query.type as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        status: req.query.status as string | undefined,
        mentorId: req.query.mentorId as string | undefined,
      };

      const { buffer, filename } = await this._adminService.exportReportPdf(
        params
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(buffer);
    } catch (err: unknown) {
      console.error("Export PDF error", err);
      res.status(500).json({
        success: false,
        message: "Failed to export PDF report",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
