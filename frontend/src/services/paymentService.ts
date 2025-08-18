import { loadScript } from "@paypal/paypal-js";
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}`,
  withCredentials: true,
});

export async function startPayment(sessionId: string, amount: number) {
  const { data } = await API.post("/payment/create", { sessionId, amount });

  const paypal = await loadScript({
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  });
  if (!paypal) throw new Error("PayPal SDK failed to load");

  if (!paypal || !paypal.Buttons) {
    throw new Error("PayPal Buttons not available");
  }

  paypal
    .Buttons({
      createOrder: () => data.id,
      onApprove: async (approveData) => {
        await API.post("/payment/capture", { orderId: approveData.orderID });
        alert("Payment successful");
      },
    })
    .render("#paypal-button-container");
}
