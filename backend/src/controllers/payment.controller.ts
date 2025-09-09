import axios from "axios";
import Payment from "../models/payment.model";
import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { SessionRepository } from "../repositories/session.repository";

const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";
const sessionRepo = new SessionRepository();

export class PaymentController {
  private async getAccessToken() {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: process.env.PAYPAL_CLIENT_ID!,
          password: process.env.PAYPAL_CLIENT_SECRET!,
        },
      }
    );
    return response.data.access_token;
  }

  createOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId, amount } = req.body;
      if (!req.id) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = await this.getAccessToken();

      const order = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await Payment.create({
        sessionId,
        userId: req.id,
        paypalOrderId: order.data.id,
        status: "CREATED",
        amount,
        currency: "USD",
      });

      res.json({ id: order.data.id });
    } catch (error: any) {
      console.error(
        "Error creating PayPal order:",
        error.response?.data || error.message
      );
      res.status(500).json({ message: "Failed to create PayPal order" });
    }
  };

  captureOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.body;
      const accessToken = await this.getAccessToken();

      const capture = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const payment = await Payment.findOneAndUpdate(
        { paypalOrderId: orderId },
        { status: "COMPLETED", details: capture.data },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }

      if (!payment.sessionId) {
        return res.status(404).json({ message: "Session idnot found" });
      }

      await sessionRepo.updateSession(payment.sessionId.toString(), {
        participants: [{ user: payment.userId, status: "accepted" }],
      });

      res.json({
        message: "Payment captured successfully & session scheduled",
        data: capture.data,
      });
    } catch (error: any) {
      console.error(
        "Error capturing PayPal order:",
        error.response?.data || error.message
      );
      res.status(500).json({ message: "Failed to capture PayPal payment" });
    }
  };

  createSubscriptionOrder = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { price } = req.body;
      if (!req.id) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = await this.getAccessToken();

      const order = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [{ amount: { currency_code: "USD", value: price } }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await Payment.create({
        userId: req.id,
        paypalOrderId: order.data.id,
        status: "CREATED",
        amount: price,
        currency: "USD",
      });

      res.json({ id: order.data.id });
    } catch (err: any) {
      console.error(
        "Error creating subscription order:",
        err.response?.data || err.message
      );
      res.status(500).json({ message: "Failed to create subscription order" });
    }
  };

  captureSubscriptionOrder = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { orderId } = req.body;
      if (!req.id) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = await this.getAccessToken();

      const capture = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const payment = await Payment.findOneAndUpdate(
        { paypalOrderId: orderId },
        { status: "COMPLETED", details: capture.data },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json({
        success: true,
        message: "Subscription payment captured successfully",
        payment,
      });
    } catch (err: any) {
      console.error(
        "Error capturing subscription:",
        err.response?.data || err.message
      );
      res.status(500).json({ message: "Failed to capture subscription order" });
    }
  };
}
