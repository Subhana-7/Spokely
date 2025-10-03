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

  async credit(userId: string, amount: number, reason: string, sessionId?: string, subscriptionId?: string):Promise<IWallet | null> {
    return this._walletRepo.addTransaction(userId, amount, "CREDIT", reason, sessionId, subscriptionId);
  }

  async debit(userId: string, amount: number, reason: string, sessionId?: string, subscriptionId?: string):Promise<IWallet | null> {
    return this._walletRepo.addTransaction(userId, amount, "DEBIT", reason, sessionId, subscriptionId);
  }

  async getBalance(userId: string):Promise<number | null> {
    const wallet = await this._walletRepo.getWallet(userId);
    return wallet?.balance || 0;
  }

  async getTransactions(userId: string):Promise<unknown> {
    const wallet = await this._walletRepo.getWallet(userId);
    return wallet?.transactions || [];
  }
}
