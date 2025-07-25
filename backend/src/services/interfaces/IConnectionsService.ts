import { IConnection } from "../../models/connections.model"; 
import { IUser } from "../../models/user.model";
import { PopulatedConnection } from "../../types/populated";

export interface IConnectionService {
  sendConnectionRequest(senderId: string, referralCode: string): Promise<IConnection | null>;
  getIncomingRequests(userId: string): Promise<IConnection[] | null>;
  getOutgoingRequests(userId: string): Promise<IConnection[] | null>;
  getAllConnections(userId: string): Promise<PopulatedConnection[] | null>;
  acceptRequest(requestId: string): Promise<IConnection | null>;
}
