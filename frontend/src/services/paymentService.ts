import API from "../api/axios.instance";

export interface PaymentResponse {
  orderId: string;
  id?: string;
  message?: string;
  success?: boolean;
}

export const startPayment = (sessionId: string, amount: number) =>
  API.post("/payment/create", { sessionId, amount });

export const confirmPayment = (orderId: string, sessionId: string) =>
  API.post("/payment/capture", { orderId, sessionId });

export const subscriptionStartPayment = (sessionId: string, amount: number) =>
  API.post("/payment/create-subscription", { sessionId, price: amount });

export const subscriptionConfirmPayment = (orderId: string, sessionId: string) =>
  API.post("/payment/capture-subscription", { orderId, sessionId });
