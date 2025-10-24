import { Schema, model, Document, Types } from "mongoose";

export interface IWalletTransaction {
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  sessionId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  createdAt?: Date;
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  transactions: IWalletTransaction[];
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true }
);

export default model<IWallet>("Wallet", walletSchema);
