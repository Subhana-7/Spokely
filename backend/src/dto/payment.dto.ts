import { ObjectId, Types } from "mongoose";

export interface PaymentRequestDTO {
  subscriptionId?: string;
  sessionId?: string;
  amount: number;
  orderId?: string;
  userId?:string;
}

export interface PaymentEntityDTO {
  id?: string;
  sessionId?: string;
  userId: string;
  paypalOrderId: string;
  status?: "CREATED" | "COMPLETED" | "FAILED";
  amount: number;
  currency: string;
  details?: any;
}

export interface PaymentResponseDTO {
  subscriptionId?: Types.ObjectId;
  id?: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
  details?: any;
  userId?:string;
}
