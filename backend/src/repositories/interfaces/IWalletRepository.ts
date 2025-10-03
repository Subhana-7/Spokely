import { IWallet } from "../../models/wallet.model";

export interface IWalletRepository {
  getWallet(userId: string): Promise<IWallet | null>;
  addTransaction(
      userId: string,
      amount: number,
      type: "CREDIT" | "DEBIT",
      reason: string,
      sessionId?: string,
      subscriptionId?: string
    ): Promise<IWallet | null>
}