import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { WalletRepository } from "../repositories/wallet.repository";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IWallet } from "../models/wallet.model";

@injectable()
export class WalletService {
  constructor(
    @inject(TYPES.IWalletRepository)
    private readonly _walletRepo: IWalletRepository
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
): Promise<{ transactions: unknown[]; total: number; totalPages: number; currentPage: number }> {
  const wallet = await this._walletRepo.getWallet(userId);
  const allTransactions = wallet?.transactions || [];

  // Sort by createdAt descending
  const sorted = allTransactions.sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  const total = sorted.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return {
    transactions: paginated,
    total,
    totalPages,
    currentPage: page,
  };
}

}
