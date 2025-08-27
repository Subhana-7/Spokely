import { loadScript, type PayPalNamespace } from "@paypal/paypal-js";
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}`,
  withCredentials: true,
});

interface PaymentResponse {
  id: string;
  orderId?: string;
  message?: string;
  success?: boolean;
}

export async function startPayment(sessionId: string, amount: number): Promise<PaymentResponse> {
  const { data } = await API.post("/payment/create", { sessionId, amount });

  const paypal: PayPalNamespace | null = await loadScript({
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  });

  if (!paypal?.Buttons) {
    throw new Error("PayPal SDK failed to load Buttons component");
  }

  return new Promise((resolve, reject) => {
    paypal.Buttons!({
      createOrder: () => data.id,
      onApprove: async (approveData: any) => {
        try {
          const res = await API.post("/payment/capture", {
            orderId: approveData.orderID,
          });
          resolve(res.data);
        } catch (err) {
          reject(err);
        }
      },
      onError: (err: any) => reject(err),
    }).render("#paypal-button-container");
  });
}

export async function confirmPayment(orderId: string, sessionId: string): Promise<PaymentResponse> {
  const { data } = await API.post("/payment/capture", { orderId, sessionId });
  return data;
}