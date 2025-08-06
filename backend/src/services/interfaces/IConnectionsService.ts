import { IConnection } from "../../models/connections.model";
import { PopulatedConnection } from "../../types/populated";

export interface IConnectionService {
  sendConnectionRequest(senderId: string, uniqueCode: string): Promise<IConnection | null>;

  getIncomingRequests(userId: string): Promise<PopulatedConnection[] | null>;

  acceptRequest(requestId: string, userId: string): Promise<IConnection | null>;

  rejectRequest(requestId: string, userId: string): Promise<IConnection | null>;

  getOutgoingRequests(userId: string): Promise<PopulatedConnection[] | null>;

  getAllConnections(userId: string): Promise<PopulatedConnection[] | null>;
}
