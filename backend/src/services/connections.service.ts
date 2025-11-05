import UserModel, { IUser } from "../models/user.model";
import { Types } from "mongoose";
import { IConnectionService } from "./interfaces/IConnectionsService";
import { IConnection } from "../models/connections.model";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";
import { IConnectionRepository } from "../repositories/interfaces/IConnectionsRepository";
import { PopulatedConnection } from "../types/populated";
import { ConnectionDTO } from "../dto/connection.dto";
import { mapConnectionToDTO } from "../mappers/connection.mappers";
import { MESSAGES } from "../utilis/constants";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { INotificationService } from "./interfaces/INotificationService";

@injectable()
export class ConnectionService implements IConnectionService {
  constructor(
    @inject(TYPES.IConnectionRepository)
    private _connectionRepository: IConnectionRepository,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IChatRepository) private _chatRepository: IChatRepository,
    @inject(TYPES.INotificationService) private _notificationService:INotificationService,
  ) {}

  async sendConnectionRequest(
    senderId: string,
    uniqueCode: string
  ): Promise<ConnectionDTO | null> {
    try {
      const receiver = await this._userRepository.findOne({
        uniqueCode: uniqueCode,
        isBlocked: false,
        isVerified: true,
      });

      console.log(receiver, senderId, uniqueCode);

      if (!receiver) throw new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      if (receiver._id.equals(senderId))
        throw new Error(MESSAGES.ERROR.INVALID_INPUT);

      const existing = await this._connectionRepository.findByUniqueCode(
        new Types.ObjectId(senderId),
        receiver._id
      );

      if (existing) throw new Error(MESSAGES.ERROR.CONNECTION_EXISTS);

      const connection = await this._connectionRepository.createConnection(
        new Types.ObjectId(senderId),
        receiver._id
      );

       await this._notificationService.send({
      userId:receiver.id,
      title:"New Connection Request.",
      message:"A new connection request send to you, Check it out.",
      type:"success",
    })

      return connection
        ? mapConnectionToDTO(connection as unknown as PopulatedConnection)
        : null;
    } catch (error) {
      console.log("sendConnectionRequest error", error);
      return null;
    }
  }

  async getIncomingRequests(userId: string): Promise<ConnectionDTO[] | null> {
    try {
      const requests = await this._connectionRepository.getReceivedRequests(
        new Types.ObjectId(userId)
      );
      return requests ? requests.map(mapConnectionToDTO) : null;
    } catch (error) {
      console.log("getIncomingRequests error", error);
      return null;
    }
  }

  async acceptRequest(
    requestId: string,
    userId: string
  ): Promise<ConnectionDTO | null> {
    try {
      console.log(requestId, userId);

      const connection = await this._connectionRepository.acceptRequest(
        requestId,
        new Types.ObjectId(userId)
      );

      if (!connection) return null;

      const participants = [
        connection.userId.toString(),
        connection.connectedUserId.toString(),
      ].sort();

      const sessionId = participants.join("_");

      await this._chatRepository.findOrCreateSession(sessionId, participants);

      await this._notificationService.send({
      userId:connection.userId.toString(),
      title:"Connection Request Accepted",
      message:"Your connection request is accepted, Check it out.",
      type:"success",
    })

      return mapConnectionToDTO(connection as unknown as PopulatedConnection);
    } catch (error) {
      console.log("acceptRequest error", error);
      return null;
    }
  }

   async getAllConnections(
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ connections: ConnectionDTO[]; total: number; page: number; totalPages: number } | null> {
    try {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      const connections =
        await this._connectionRepository.findWithFilters(userId, {
          search: filters?.search,
          status: filters?.status,
          page,
          limit,
        });

      const total = await this._connectionRepository.countWithFilters(userId, {
        search: filters?.search,
        status: filters?.status,
      });

      const dtos = connections.map(mapConnectionToDTO);

      return {
        connections: dtos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log("getAllConnections error", error);
      return null;
    }
  }


  async getOutgoingRequests(userId: string): Promise<ConnectionDTO[] | null> {
    try {
      const requests = await this._connectionRepository.getSentRequests(
        new Types.ObjectId(userId)
      );
      return requests ? requests.map(mapConnectionToDTO) : null;
    } catch (error) {
      console.log("getOutgoingRequests error", error);
      return null;
    }
  }

  async rejectRequest(
    requestId: string,
    userId: string
  ): Promise<ConnectionDTO | null> {
    try {
      const connection = await this._connectionRepository.rejectRequest(
        requestId,
        new Types.ObjectId(userId)
      );

       await this._notificationService.send({
      userId:requestId,
      title:"Connection Request Rejected",
      message:"Your connection request is Rejected, Check it out.",
      type:"success",
    })

      return connection
        ? mapConnectionToDTO(connection as unknown as PopulatedConnection)
        : null;
    } catch (error) {
      console.log("rejectRequest error", error);
      return null;
    }
  }

  async blockConnection(connectionId: string, userId: string) {
    const connection = await this._connectionRepository.findById(connectionId);
    if (!connection) throw new Error("Connection not found");
    if (
      connection.userId.toString() !== userId &&
      connection.connectedUserId.toString() !== userId
    )
      throw new Error("Unauthorized");

    const updated = await this._connectionRepository.blockConnection(
      connectionId,
      userId
    );
    return updated
      ? mapConnectionToDTO(updated as unknown as PopulatedConnection)
      : null;
  }

  async unblockConnection(connectionId: string, userId: string) {
    const connection = await this._connectionRepository.findById(connectionId);
    if (!connection) throw new Error("Connection not found");
    if (
      connection.userId.toString() !== userId &&
      connection.connectedUserId.toString() !== userId
    )
      throw new Error("Unauthorized");

    const updated = await this._connectionRepository.unblockConnection(
      connectionId
    );
    return updated
      ? mapConnectionToDTO(updated as unknown as PopulatedConnection)
      : null;
  }

  async removeConnection(connectionId: string) {
    const connection = await this._connectionRepository.findById(connectionId);
    if (!connection) throw new Error("Connection not found");

    const result = await this._connectionRepository.deleteConnection(
      connectionId
    );

    return result;
  }
}
