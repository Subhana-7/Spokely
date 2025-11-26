import API from "../api/axios.instance";
import { PAYMENT_ROUTES as R } from "../constants/routes";

export interface PaymentResponse {
  orderId: string;
  id?: string;
  message?: string;
  success?: boolean;
}

export const startPayment = (sessionId: string, amount: number) =>
  API.post<PaymentResponse>(`${R.base}${R.create}`, { sessionId, amount });

export const confirmPayment = (orderId: string, sessionId: string) =>
  API.post<PaymentResponse>(`${R.base}${R.capture}`, { orderId, sessionId });

export const subscriptionStartPayment = (sessionId: string, amount: number) => {
  console.log("subscriptionStartPayment payload:", { sessionId, amount });
  return API.post<PaymentResponse>(`${R.base}${R.createSubscription}`, { sessionId, amount });
};

export const subscriptionConfirmPayment = (orderId: string, sessionId: string) =>
  API.post<PaymentResponse>(`${R.base}${R.captureSubscription}`, { orderId, sessionId });


export const wallet = (page = 1, limit = 10) =>
  API.get(`${R.base}${R.wallet}?page=${page}&limit=${limit}`);