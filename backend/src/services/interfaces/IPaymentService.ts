import { PaymentRequestDTO } from "../../dto/payment.dto";

export interface IPaymentService {
  createOrder(userId: string, dto: PaymentRequestDTO): Promise<{ id: string }>;
  captureOrder(userId: string, dto: PaymentRequestDTO): Promise<any>;
  createSubscription(userId: string, dto: PaymentRequestDTO): Promise<{ id: string }>;
  captureSubscription(userId: string, dto: PaymentRequestDTO): Promise<any>;
}