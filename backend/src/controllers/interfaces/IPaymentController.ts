import { AuthenticatedRequest } from "../../types/authenticatedRequest";
import { Response } from "express";

export interface IPaymentController {
  createOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
  captureOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
  createSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
  captureSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;

  wallet(req: AuthenticatedRequest, res: Response): Promise<void>;
}
