import { PaymentEntityDTO } from "../dto/payment.dto";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";
import Payment from "../models/payment.model";
import { PaymentMapper } from "../mappers/payment.mapper";
import { injectable } from "inversify";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  async create(data: Partial<PaymentEntityDTO>): Promise<PaymentEntityDTO> {
    const payment = await Payment.create(data);
    return PaymentMapper.toEntity(payment);
  }

  async updateByPaypalId(orderId: string, update: Partial<PaymentEntityDTO>): Promise<PaymentEntityDTO | null> {
    const payment = await Payment.findOneAndUpdate(
      { paypalOrderId: orderId },
      update,
      { new: true }
    );
    return payment ? PaymentMapper.toEntity(payment) : null;
  }
}
