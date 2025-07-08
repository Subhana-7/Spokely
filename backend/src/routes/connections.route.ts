import express from 'express';
import {
  sendRequest,
  getRequests,
  acceptConnection,
  listConnections,
  getSentRequests
} from '../controllers/connections.controller';
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post('/send', authMiddleware(["user", "mentor"]), sendRequest);
router.get('/requests', authMiddleware(["user", "mentor"]), getRequests);
router.patch('/accept/:requestId', authMiddleware(["user", "mentor"]), acceptConnection);
router.get('/list', authMiddleware(["user", "mentor"]), listConnections);
router.get('/sent-requests', authMiddleware(["user", "mentor"]), getSentRequests);



export default router;
