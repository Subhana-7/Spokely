import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  paypalOrderId: string;
  status: 'CREATED' | 'COMPLETED' | 'FAILED';
  amount: number;
  currency: string;
  details?: any; 
}

const paymentSchema = new Schema<IPayment>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  paypalOrderId: { type: String, required: true },
  status: { type: String, enum: ['CREATED', 'COMPLETED', 'FAILED'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  details: { type: Object }
}, { timestamps: true });

export default model<IPayment>('Payment', paymentSchema);
