import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import Wallet, { IWallet } from "../models/wallet.model";

@injectable()
export class WalletRepository extends BaseRepository<IWallet> {
  constructor() {
    super(Wallet);
  }

  async getWallet(userId: string): Promise<IWallet | null> {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0, transactions: [] });
    }
    return wallet;
  }

  async addTransaction(
    userId: string,
    amount: number,
    type: "CREDIT" | "DEBIT",
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return null;

    const newBalance = type === "CREDIT" ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0) throw new Error("Insufficient balance");

    wallet.balance = newBalance;
    wallet.transactions.push({
      type,
      amount,
      reason,
      sessionId: sessionId ? sessionId as any : undefined,
      subscriptionId: subscriptionId ? subscriptionId as any : undefined,
    });

    await wallet.save();
    return wallet;
  }
}
