import { Types } from "mongoose";
import { IConnection } from "../../models/connections.model";
import { PopulatedConnection } from "../../types/populated";

export interface IConnectionRepository {
  createConnection(
    userId: Types.ObjectId,
    connectedUserId: Types.ObjectId
  ): Promise<IConnection | null>;

  findByUniqueCode(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<IConnection | null>;

  getReceivedRequests(userId: Types.ObjectId): Promise<PopulatedConnection[] | null>;

  getSentRequests(userId: Types.ObjectId): Promise<PopulatedConnection[] | null>;

  getAcceptedConnections(userId: Types.ObjectId,search:any): Promise<PopulatedConnection[] | null>;

  acceptRequest(requestId: string, userId: Types.ObjectId): Promise<IConnection | null>;

  rejectRequest(requestId: string, userId: Types.ObjectId): Promise<IConnection | null>;
}
