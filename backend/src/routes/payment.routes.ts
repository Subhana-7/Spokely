import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { RequestHandler } from "express";

const router = Router();
const paymentController = new PaymentController();

router.post("/create",authMiddleware(["user"]), paymentController.createOrder as RequestHandler);
router.post("/capture",authMiddleware(["user"]), paymentController.captureOrder as RequestHandler);

export default router;
