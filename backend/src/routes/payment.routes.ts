import { Router, RequestHandler } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const paymentController = new PaymentController();

router.post(
  "/create",
  authMiddleware(["user"]),
  paymentController.createOrder as RequestHandler
);
router.post(
  "/capture",
  authMiddleware(["user"]),
  paymentController.captureOrder as RequestHandler
);

router.post(
  "/create-subscription",
  authMiddleware(["user"]),
  paymentController.createSubscriptionOrder as RequestHandler
);
router.post(
  "/capture-subscription",
  authMiddleware(["user"]),
  paymentController.captureSubscriptionOrder as RequestHandler
);

export default router;
