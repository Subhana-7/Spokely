export interface PaymentRequestDTO {
  subscriptionId: ObjectId | undefined;
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
  subscriptionId: boolean;
  id?: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
  details?: any;
  userId?:string;
}
