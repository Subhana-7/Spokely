import axios from "axios";

const paypalAPI = axios.create({
  baseURL: process.env.PAYPAL_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPaypalAuth = () => ({
  username: process.env.PAYPAL_CLIENT_ID!,
  password: process.env.PAYPAL_CLIENT_SECRET!,
});

paypalAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("PayPal API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default paypalAPI;
