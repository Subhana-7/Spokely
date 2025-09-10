import { Types } from "mongoose";
import { IPayment } from "../models/payment.model";
import { PaymentEntityDTO, PaymentResponseDTO } from "../dto/payment.dto";

export class PaymentMapper {
  // DB → DTO
  static toEntity(doc: IPayment): PaymentEntityDTO {
    return {
      id: doc._id?.toString(),
      sessionId: doc.sessionId?.toString(),
      userId: doc.userId?.toString(),
      paypalOrderId: doc.paypalOrderId,
      status: doc.status,
      amount: doc.amount,
      currency: doc.currency,
      details: doc.details,
    };
  }

  // DTO → DB (fix for your create/update issue)
  static toPersistence(dto: PaymentEntityDTO): Partial<IPayment> {
    return {
      sessionId: dto.sessionId ? new Types.ObjectId(dto.sessionId) : undefined,
      userId: new Types.ObjectId(dto.userId),
      paypalOrderId: dto.paypalOrderId,
      status: dto.status,
      amount: dto.amount,
      currency: dto.currency,
      details: dto.details,
    };
  }

  // DTO → Response (for API output)
  static toResponse(entity: PaymentEntityDTO): PaymentResponseDTO {
    return {
      id: entity.id,
      paypalOrderId: entity.paypalOrderId,
      status: entity.status!,
      amount: entity.amount,
      currency: entity.currency,
      details: entity.details,
    };
  }
}
