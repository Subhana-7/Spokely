import axios from "axios";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import {
  PaymentRequestDTO,
  PaymentEntityDTO,
  PaymentResponseDTO,
} from "../dto/payment.dto";
import { IPaymentService } from "./interfaces/IPaymentService";
import { PaymentMapper } from "../mappers/payment.mapper";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import paypalAPI, { getPaypalAuth } from "../config/paypal.axios";
import { IWalletService } from "./interfaces/IWalletService";
import { MESSAGES } from "../utilis/constants";
import { INotificationService } from "./interfaces/INotificationService";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL!;

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.IPaymentRepository)
    private _paymentRepository: IPaymentRepository,
    @inject(TYPES.ISessionRepository)
    private _sessionRepository: ISessionRepository,
    @inject(TYPES.IWalletService)
    private readonly _walletService: IWalletService,
    @inject(TYPES.INotificationService)
    private readonly _notificationService: INotificationService
  ) {}

  private async getAccessToken(): Promise<string> {
    const response = await paypalAPI.post(
      "/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: getPaypalAuth(),
      }
    );
    return response.data.access_token;
  }

  async createOrder(
    userId: string,
    dto: PaymentRequestDTO
  ): Promise<{ id: string }> {
    console.log("service pay");
    const accessToken = await this.getAccessToken();

    const order = await paypalAPI.post(
      "/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          { amount: { currency_code: "USD", value: dto.amount } },
        ],
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const entity: PaymentEntityDTO = {
      sessionId: dto.sessionId,
      userId,
      paypalOrderId: order.data.id,
      status: "CREATED",
      amount: dto.amount,
      currency: "USD",
    };

    await this._paymentRepository.create(PaymentMapper.toPersistence(entity));

    return { id: order.data.id };
  }

  async captureOrder(
    userId: string,
    dto: PaymentRequestDTO
  ): Promise<PaymentResponseDTO> {
    const accessToken = await this.getAccessToken();

    const capture = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${dto.orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const paymentEntity = await this._paymentRepository.updateByPaypalId(
      dto.orderId!,
      {
        status: "COMPLETED",
        details: capture.data,
      }
    );

    if (paymentEntity?.sessionId) {
      const sessionIdStr = paymentEntity.sessionId.toString();
      const userIdStr = paymentEntity.userId.toString();

      const session = await this._sessionRepository.addParticipant(
        sessionIdStr,
        userIdStr
      );

      console.log(session?.type, session?.sessionFee, session?.createdBy);

      if (
        session?.type === "public" &&
        session.sessionFee &&
        session.createdBy
      ) {
        const res = await this._walletService.credit(
          session.createdBy.toString(),
          session.sessionFee,
          `Payment received from ${userIdStr} for session: ${session.topic}`,
          session._id?.toString(), 
          undefined 
        );
        console.log(res, "payment");
      }
    }

    const entityDTO = PaymentMapper.toEntity(paymentEntity!);
    return PaymentMapper.toResponse(entityDTO);
  }

  async createSubscription(
    userId: string,
    dto: PaymentRequestDTO
  ): Promise<{ id: string }> {
    return this.createOrder(userId, dto);
  }

  async captureSubscription(
    userId: string,
    dto: PaymentRequestDTO
  ): Promise<PaymentResponseDTO> {
    let payment = await this.captureOrder(userId, dto);
    if (!payment) {
      throw new Error(MESSAGES.ERROR.NOT_FOUND);
    }
    console.log(payment);
    if (payment?.status === "COMPLETED") {
      await this._notificationService.send({
        userId: userId,
        title: "Subscription Successful",
        message:
          "Your new Subscription is successfull. Enjoy our subscription feature.",
        type: "success",
      });
    } else if (payment?.status === "COMPLETED") {
      await this._notificationService.send({
        userId: userId,
        title: "Subscription Request Failed",
        message:
          "Your new Subscription Request failed due to payment failure in payment request.",
        type: "success",
      });
    }
    return payment;
  }

  async getAllPayments(): Promise<PaymentResponseDTO[]> {
    const payments = await this._paymentRepository.findAllPayment();
    return payments.map((p) =>
      PaymentMapper.toResponse(PaymentMapper.toEntity(p))
    );
  }

  async getPaymentById(id: string): Promise<PaymentResponseDTO | null> {
    const payment = await this._paymentRepository.findById(id);
    return payment
      ? PaymentMapper.toResponse(PaymentMapper.toEntity(payment))
      : null;
  }
}
