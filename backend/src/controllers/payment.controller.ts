import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { IPaymentService } from "../services/interfaces/IPaymentService";
import { IPaymentController } from "./interfaces/IPaymentController";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private paymentService: IPaymentService
  ) {}

  createOrder = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const result = await this.paymentService.createOrder(req.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  captureOrder = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const result = await this.paymentService.captureOrder(req.id, req.body);
      res.json({ message: "Payment captured successfully", data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  createSubscription = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const result = await this.paymentService.createSubscription(
        req.id,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  captureSubscription = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const result = await this.paymentService.captureSubscription(
        req.id,
        req.body
      );
      res.json({ message: "Subscription captured successfully", data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
