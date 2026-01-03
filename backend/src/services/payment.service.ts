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
import {
  MESSAGES,
  PAYMENT_STATUS,
  PAYPAL_INTENT,
  CURRENCY,
  SESSION_TYPE,
  SUBSCRIPTION_MESSAGES,
  NOTIFICATION_TYPE,
} from "../utilis/constants";
import { IWalletService } from "./interfaces/IWalletService";
import { INotificationService } from "./interfaces/INotificationService";
import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";

export const PAYMENT_CONSTANTS = {
  OAUTH_GRANT_TYPE: "grant_type=client_credentials",
  PAYPAL_OAUTH_URL: "/v1/oauth2/token",
  PAYPAL_ORDER_URL: "/v2/checkout/orders",
  CAPTURE_SUFFIX: "/capture",
  WALLET_DESCRIPTION: (userId: string, topic: string) =>
    `Payment received from ${userId} for session: ${topic}`,
  LOG_SESSION: "Session Type / Fee / CreatedBy:",
  LOG_PAYMENT: "Payment wallet credit:",
} as const;

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
    private readonly _notificationService: INotificationService,
    @inject(TYPES.ISubscriptionRepository) private readonly _subscriptionRepository:ISubscriptionRepository
  ) {}

  private async getAccessToken(): Promise<string> {
    const response = await paypalAPI.post(
      PAYMENT_CONSTANTS.PAYPAL_OAUTH_URL,
      PAYMENT_CONSTANTS.OAUTH_GRANT_TYPE,
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
    console.log("PAYMENT: Creating PayPal order");

    const accessToken = await this.getAccessToken();

    const order = await paypalAPI.post(
      PAYMENT_CONSTANTS.PAYPAL_ORDER_URL,
      {
        intent: PAYPAL_INTENT.CAPTURE,
        purchase_units: [
          { amount: { currency_code: CURRENCY.USD, value: dto.amount } },
        ],
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const entity: PaymentEntityDTO = {
      sessionId: dto.sessionId,
      userId,
      paypalOrderId: order.data.id,
      status: PAYMENT_STATUS.CREATED,
      amount: dto.amount,
      currency: CURRENCY.USD,
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
      `${PAYPAL_BASE_URL}${PAYMENT_CONSTANTS.PAYPAL_ORDER_URL}/${dto.orderId}${PAYMENT_CONSTANTS.CAPTURE_SUFFIX}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const paymentEntity = await this._paymentRepository.updateByPaypalId(
      dto.orderId!,
      {
        status: PAYMENT_STATUS.COMPLETED,
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

      console.log(PAYMENT_CONSTANTS.LOG_SESSION, session?.type, session?.sessionFee, session?.createdBy);

      if (
        session?.type === SESSION_TYPE.PUBLIC &&
        session.sessionFee &&
        session.createdBy
      ) {
        const walletDescription = PAYMENT_CONSTANTS.WALLET_DESCRIPTION(
          userIdStr,
          session.topic
        );

        const walletResult = await this._walletService.credit(
          session.createdBy.toString(),
          session.sessionFee,
          walletDescription,
          session._id?.toString(),
          undefined
        );

        console.log(PAYMENT_CONSTANTS.LOG_PAYMENT, walletResult);
      }
    }

    const entityDTO = PaymentMapper.toEntity(paymentEntity!);
    return PaymentMapper.toResponse(entityDTO);
  }

  async createSubscription(
  userId: string,
  dto: PaymentRequestDTO
): Promise<{ id: string }> {

  const order = await this.createOrder(userId, dto);

  await this._paymentRepository.updateByPaypalId(order.id, {
    subscriptionId: dto.subscriptionId,
  });
  return order;
}


 async captureSubscription(
  userId: string,
  dto: PaymentRequestDTO
): Promise<PaymentResponseDTO> {

  // 1️⃣ Capture PayPal payment
  const payment = await this.captureOrder(userId, dto);
  if (!payment) throw new Error(MESSAGES.ERROR.NOT_FOUND);

  // 2️⃣ If payment success AND linked to subscription → renew it
  if (
    payment.status === PAYMENT_STATUS.COMPLETED &&
    payment.subscriptionId
  ) {
    await this._subscriptionRepository.renewSubscription(
      payment.subscriptionId.toString()
    );
  }

  // 3️⃣ Notifications (already correct)
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    await this._notificationService.send({
      userId,
      title: SUBSCRIPTION_MESSAGES.SUCCESS.TITLE,
      message: SUBSCRIPTION_MESSAGES.SUCCESS.MESSAGE,
      type: NOTIFICATION_TYPE.SUCCESS,
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
