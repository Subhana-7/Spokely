import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IWallet } from "../models/wallet.model";

@injectable()
export class WalletService {
  constructor(
    @inject(TYPES.IWalletRepository)
    private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepo: IUserRepository
  ) {}

  async credit(
    userId: string,
    amount: number,
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null> {
    return this._walletRepo.addTransaction(
      userId,
      amount,
      "CREDIT",
      reason,
      sessionId,
      subscriptionId
    );
  }

  async debit(
    userId: string,
    amount: number,
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null> {
    return this._walletRepo.addTransaction(
      userId,
      amount,
      "DEBIT",
      reason,
      sessionId,
      subscriptionId
    );
  }

  async getBalance(userId: string): Promise<number | null> {
    const wallet = await this._walletRepo.getWallet(userId);
    return wallet?.balance || 0;
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ transactions: any[]; total: number; totalPages: number; currentPage: number }> {
    const wallet = await this._walletRepo.getWallet(userId);
    const allTransactions = wallet?.transactions || [];

    const sorted = allTransactions.sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );

    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    const enhanced = await Promise.all(
      paginated.map(async (tx) => {
        let updatedReason = tx.reason;

        const match = tx.reason.match(/from ([a-f0-9]{24})/);
        if (match) {
          const fromUserId = match[1];
          const user = await this._userRepo.findById(fromUserId);
          if (user?.name) {
            updatedReason = tx.reason.replace(fromUserId, user.name);
          }
        }

        return { ...tx.toObject?.() ?? tx, reason: updatedReason };
      })
    );

    return {
      transactions: enhanced,
      total,
      totalPages,
      currentPage: page,
    };
  }
}
