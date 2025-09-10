import { PaymentEntityDTO } from "../../dto/payment.dto";

export interface IPaymentRepository {
  create(data: Partial<PaymentEntityDTO>): Promise<PaymentEntityDTO>;
  updateByPaypalId(orderId: string, update: Partial<PaymentEntityDTO>): Promise<PaymentEntityDTO | null>;
}
