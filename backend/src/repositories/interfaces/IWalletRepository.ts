import { IWallet } from "../../models/wallet.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IWalletRepository extends IBaseRepository<IWallet> {
  getWallet(userId: string): Promise<IWallet | null>;
  addTransaction(
    userId: string,
    amount: number,
    type: "CREDIT" | "DEBIT",
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null>;
}
