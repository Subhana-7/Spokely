import { IWallet } from "../../models/wallet.model";

export interface IWalletService {
  credit(
    userId: string,
    amount: number,
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null>;
  debit(
    userId: string,
    amount: number,
    reason: string,
    sessionId?: string,
    subscriptionId?: string
  ): Promise<IWallet | null>;
  getBalance(userId: string): Promise<number | null>;
  getTransactions(userId: string): Promise<unknown>;
}
