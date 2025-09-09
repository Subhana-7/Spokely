import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}/payment`,
  withCredentials: true,
});

export interface PaymentResponse {
  orderId: string;
  id?: string;
  message?: string;
  success?: boolean;
}

export async function startPayment(sessionId: string, amount: number): Promise<PaymentResponse> {
  const { data } = await API.post("/create", { sessionId, amount });
  return { orderId: data.id || data.orderId };
}

export async function confirmPayment(orderId: string, sessionId: string): Promise<PaymentResponse> {
  const { data } = await API.post("/capture", { orderId, sessionId });
  return data;
}


export async function subscriptionStartPayment(sessionId: string, amount: number): Promise<PaymentResponse> {
  const { data } = await API.post("/create-subscription", { sessionId, price: amount });
  return { orderId: data.id || data.orderId };
}

export async function subscriptionConfirmPayment(orderId: string, sessionId: string): Promise<PaymentResponse> {
  const { data } = await API.post("/capture-subscription", { orderId, sessionId });
  return data;
}