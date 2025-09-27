import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { IPaymentService } from "../services/interfaces/IPaymentService";
import { IPaymentController } from "./interfaces/IPaymentController";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private _paymentService: IPaymentService
  ) {}

  createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log("create order");
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const result = await this._paymentService.createOrder(req.id, req.body);
      console.log(result);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };

  captureOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log("capture order");
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const result = await this._paymentService.captureOrder(req.id, req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: "Payment captured successfully", data: result });
    } catch (error: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };

  createSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log("hiting");
    try {
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      
      console.log(req.body)
      const result = await this._paymentService.createSubscription(req.id, req.body);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };

  captureSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const result = await this._paymentService.captureSubscription(req.id, req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: "Subscription captured successfully", data: result });
    } catch (error: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };
}
