import { Types } from "mongoose";
import { IConnection } from "../../models/connections.model";

export interface IConnectionRepository {
  createConnection(userId: Types.ObjectId, connectedUserId: Types.ObjectId): Promise<IConnection | null>;
  findByReferralCode(senderId: Types.ObjectId, receiverId: Types.ObjectId): Promise<IConnection | null>;
  getReceivedRequests(userId: Types.ObjectId): Promise<IConnection[] | null>;
  acceptRequest(requestId: string): Promise<IConnection | null>;
  getAcceptedConnections(userId: Types.ObjectId): Promise<IConnection[] | null>;
  getSentRequests(userId: Types.ObjectId): Promise<IConnection[] | null>;
}
