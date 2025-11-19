import bcrypt from "bcrypt";
import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { IEmailService } from "./interfaces/IEmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IAdminService } from "./interfaces/IAdminService";
import { IMentor } from "../models/mentor.model";
import { generateAccessToken, generateRefreshToken } from "../utilis/token";
import { mapAdminToDto, mapUserToSummaryDto } from "../mappers/admin.mapper";
import { AdminResponseDto, UserSummaryDto } from "../dto/admin.dto";
import { MESSAGES } from "../utilis/constants";

import {
  ACCOUNT_STATUS,
  SESSION_STATUS,
  PAYMENT_STATUS,
  CONNECTION_STATUS,
  SUBSCRIPTION_STATUS,
  QUERY_STATUS,
  SORT_BY,
  VERIFICATION_STATUS
} from "../utilis/constants";

import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { ISession } from "../models/sessions.model";

import User from "../models/user.model";
import Mentor from "../models/mentor.model";
import Session from "../models/sessions.model";
import Payment from "../models/payment.model";
import Wallet from "../models/wallet.model";
import Subscription from "../models/subscription.modal";
import { DailyTaskModel } from "../models/daily.task.model";
import Connection from "../models/connections.model";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IEmailService) private _emailService: IEmailService,
    @inject(TYPES.ISessionRepository)
    private _sessionRepository: ISessionRepository
  ) {}

  /* ============================================================
     LOGIN
  ============================================================ */
  async login(
    email: string,
    rawPassword: string
  ): Promise<{
    admin: AdminResponseDto;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);

    const match = await bcrypt.compare(rawPassword, admin.password);
    if (!match) throw new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);

    return {
      admin: mapAdminToDto(admin),
      accessToken: generateAccessToken({ id: admin._id, role: admin.role }),
      refreshToken: generateRefreshToken({ id: admin._id, role: admin.role }),
    };
  }

  /* ============================================================
     USER STATUS UPDATE
  ============================================================ */
  async updateUserStatus(userId: string, status: string) {
    const actions: Record<string, () => Promise<any>> = {
      [ACCOUNT_STATUS.UNBLOCKED]: () => this._adminRepository.unblockUser(userId),
      [ACCOUNT_STATUS.BLOCKED]: () => this._adminRepository.blockUser(userId),
    };

    const action = actions[status];
    if (!action) throw new Error(MESSAGES.ERROR.INVALID_INPUT);

    const updatedUser = await action();

    const successMessage =
      status === ACCOUNT_STATUS.UNBLOCKED
        ? MESSAGES.SUCCESS.USER_UNBLOCKED
        : MESSAGES.SUCCESS.USER_BLOCKED;

    return {
      message: successMessage,
      user: mapUserToSummaryDto(updatedUser),
    };
  }

  /* ============================================================
     MENTOR STATUS UPDATE
  ============================================================ */
  async updateMentorStatus(mentorId: string, status: string) {
    const actions: Record<string, () => Promise<any>> = {
      [ACCOUNT_STATUS.UNBLOCKED]: () =>
        this._adminRepository.unblockMentor(mentorId),
      [ACCOUNT_STATUS.BLOCKED]: () => this._adminRepository.blockMentor(mentorId),
    };

    const action = actions[status];
    if (!action) throw new Error(MESSAGES.ERROR.INVALID_INPUT);

    const mentor = await action();

    const successMessage =
      status === ACCOUNT_STATUS.UNBLOCKED
        ? MESSAGES.SUCCESS.MENTOR_UNBLOCKED
        : MESSAGES.SUCCESS.MENTOR_BLOCKED;

    return {
      message: successMessage,
      user: mentor,
    };
  }

  /* ============================================================
     MENTOR FETCH/APPROVAL
  ============================================================ */
  async getMentor(mentorId: string): Promise<IMentor[] | null> {
    return this._adminRepository.getMentor(mentorId);
  }

  async approveMentor(mentorId: string): Promise<IMentor | null> {
    const mentor = await this._adminRepository.getMentor(mentorId);
    const email = mentor?.[0]?.email;

    if (email)
      await this._emailService.sendVerificationUpdateEmail(email, "approved");

    return this._adminRepository.updateMentor(mentorId);
  }

  async rejectMentor(
    mentorId: string,
    reason: string
  ): Promise<IMentor | null> {
    const mentor = await this._adminRepository.getMentor(mentorId);
    const email = mentor?.[0]?.email;

    if (email)
      await this._emailService.sendVerificationUpdateEmail(email, "rejected");

    return this._adminRepository.updateMentorRejection(mentorId, reason);
  }

  /* ============================================================
     USER LIST PAGINATION
  ============================================================ */
  async getAllUsersWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    minSessions?: number;
    maxSessions?: number;
    minMentors?: number;
    maxMentors?: number;
    isBlocked?: boolean;
  }): Promise<{ users: UserSummaryDto[]; total: number }> {
    const { users, total } =
      await this._adminRepository.findAllUsersWithQuery(params);

    return { users: users.map(mapUserToSummaryDto), total };
  }

  /* ============================================================
     MENTOR LIST QUERY
  ============================================================ */
  async getAllMentorsWithQuery(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string | (typeof SORT_BY)[keyof typeof SORT_BY];
    verificationStatus?: typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];
    isBlocked?: boolean;
  }): Promise<{ mentors: IMentor[]; total: number }> {
    return this._adminRepository.findAllMentorsWithQuery(params);
  }

  /* ============================================================
     ADMIN DASHBOARD HOME
  ============================================================ */
  async getHome(adminId: string): Promise<AdminResponseDto | null> {
    const admin = await this._adminRepository.findById(adminId);
    return admin ? mapAdminToDto(admin) : null;
  }

  /* ============================================================
     DASHBOARD STATS
  ============================================================ */
  async getDashboardStats() {
    const [
      totalUsers,
      totalMentors,
      totalSessions,
      completedPayments,
      totalConnections,
      totalSubscriptions,
      totalDailyTasks,
      wallets,
    ] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Mentor.countDocuments({ isVerified: true }),
      Session.countDocuments({}),
      Payment.countDocuments({ status: PAYMENT_STATUS.COMPLETED }),
      Connection.countDocuments({ status: CONNECTION_STATUS.ACCEPTED }),
      Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
      DailyTaskModel.countDocuments({}),
      Wallet.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
    ]);

    const walletBalance = wallets[0]?.total || 0;

    const paymentSum = await Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.COMPLETED } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    return {
      totalUsers,
      totalMentors,
      totalSessions,
      totalPayments: paymentSum[0]?.totalAmount || 0,
      totalConnections,
      totalSubscriptions,
      totalDailyTasks,
      walletBalance,
    };
  }

  /* ============================================================
     ADMIN – SESSION FILTERING / SEARCH
  ============================================================ */
  async getAllSessionsAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ sessions: ISession[]; total: number }> {
    const { page = 1, limit = 10, search = "", status = QUERY_STATUS.ALL } =
      params;

    const query: any = {};

    if (status !== QUERY_STATUS.ALL) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: "i" } },
        { "createdBy.name": { $regex: search, $options: "i" } },
        { "createdBy.email": { $regex: search, $options: "i" } },
      ];
    }

    const { sessions, total } =
      await this._sessionRepository.findSessionsPaginated(query, {
        page,
        limit,
      });

    return { sessions, total };
  }
}
