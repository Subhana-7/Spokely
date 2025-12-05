import { PaymentEntityDTO } from "../dto/payment.dto";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";
import Payment, { IPayment } from "../models/payment.model";
import { PaymentMapper } from "../mappers/payment.mapper";
import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(Payment);
  }

  async create(data: Partial<IPayment>): Promise<IPayment | null> {
    try {
      return Payment.create(data);
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateByPaypalId(
    orderId: string,
    update: Partial<IPayment>
  ): Promise<IPayment | null> {
    try {
      return Payment.findOneAndUpdate({ paypalOrderId: orderId }, update, {
        new: true,
      });
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findAllPayment(): Promise<IPayment[]> {
    return Payment.find().populate("userId sessionId subscriptionId");
  }

  async findById(id: string): Promise<IPayment | null> {
    return Payment.findById(id).populate("userId sessionId subscriptionId");
  }
}
