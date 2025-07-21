import express from 'express';
import { ConnectionController } from '../controllers/connections.controller';
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const controller = new ConnectionController();

router.post('/send', authMiddleware(["user", "mentor"]), controller.sendRequest);
router.get('/requests', authMiddleware(["user", "mentor"]), controller.getRequests);
router.patch('/accept/:requestId', authMiddleware(["user", "mentor"]), controller.acceptConnection);
router.get('/list', authMiddleware(["user", "mentor"]), controller.listConnections);
router.get('/sent-requests', authMiddleware(["user", "mentor"]), controller.getSentRequests);



export default router;
