import { PaymentEntityDTO } from "../../dto/payment.dto";
import { IPayment } from "../../models/payment.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
  updateByPaypalId(orderId: string, update: Partial<IPayment>): Promise<IPayment | null>;
}
