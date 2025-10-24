import { PaymentRequestDTO, PaymentResponseDTO } from "../../dto/payment.dto";

export interface IPaymentService {
  createOrder(userId: string, dto: PaymentRequestDTO): Promise<{ id: string }>;
  captureOrder(userId: string, dto: PaymentRequestDTO): Promise<any>;
  createSubscription(
    userId: string,
    dto: PaymentRequestDTO
  ): Promise<{ id: string }>;
  captureSubscription(userId: string, dto: PaymentRequestDTO): Promise<any>;

  getAllPayments(): Promise<PaymentResponseDTO[]>;

  getPaymentById(id: string): Promise<PaymentResponseDTO | null>;
}
