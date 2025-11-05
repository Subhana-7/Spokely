import { ConnectionDTO } from "../../dto/connection.dto";

export interface IConnectionService {
  sendConnectionRequest(
    senderId: string,
    uniqueCode: string
  ): Promise<ConnectionDTO | null>;

  getIncomingRequests(userId: string): Promise<ConnectionDTO[] | null>;

  acceptRequest(
    requestId: string,
    userId: string
  ): Promise<ConnectionDTO | null>;

  rejectRequest(
    requestId: string,
    userId: string
  ): Promise<ConnectionDTO | null>;

  getOutgoingRequests(userId: string): Promise<ConnectionDTO[] | null>;

 getAllConnections(
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ connections: ConnectionDTO[]; total: number; page: number; totalPages: number } | null>;

  blockConnection(connectionId: string, userId: string): Promise<unknown>;

  unblockConnection(connectionId: string, userId: string): Promise<unknown>;

  removeConnection(cconnectionId: string): Promise<unknown>;
}
