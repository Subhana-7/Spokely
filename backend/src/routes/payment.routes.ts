import { Router, RequestHandler } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Container } from "inversify";
import container from "../config/inversify.config";
import { IPaymentController } from "../controllers/interfaces/IPaymentController";
import { TYPES } from "../types/types";

const router = Router();
const paymentController = container.get<IPaymentController>(TYPES.IPaymentController);

router.post(
  "/create",
  authMiddleware(["user"]),
  paymentController.createOrder.bind(paymentController)
);
router.post(
  "/capture",
  authMiddleware(["user"]),
  paymentController.captureOrder.bind(paymentController)
);

router.post(
  "/create-subscription",
  authMiddleware(["user"]),
  paymentController.createSubscription.bind(paymentController)
);
router.post(
  "/capture-subscription",
  authMiddleware(["user"]),
  paymentController.captureSubscription.bind(paymentController)
);

router.get("/wallet",authMiddleware(["user","mentor"]),paymentController.wallet.bind(paymentController));

export default router;
