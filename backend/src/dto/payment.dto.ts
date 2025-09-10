export interface PaymentRequestDTO {
  sessionId?: string;
  amount: number;
  orderId?: string;
}

export interface PaymentEntityDTO {
  id?: string;
  sessionId?: string;
  userId: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
  details?: any;
}

export interface PaymentResponseDTO {
  id?: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
  details?: any;
}
