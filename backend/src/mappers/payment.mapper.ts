import { PaymentEntityDTO, PaymentResponseDTO } from "../dto/payment.dto";
import { Document } from "mongoose";

export class PaymentMapper {
  static toEntity(doc: any): PaymentEntityDTO {
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

  static toResponse(entity: PaymentEntityDTO): PaymentResponseDTO {
    return {
      id: entity.id,
      paypalOrderId: entity.paypalOrderId,
      status: entity.status,
      amount: entity.amount,
      currency: entity.currency,
      details: entity.details,
    };
  }
}
