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

@injectable()
export class ConnectionService implements IConnectionService {
  constructor(
    @inject(TYPES.IConnectionRepository) private _connectionRepository: IConnectionRepository,
    @inject(TYPES.IUserRepository) private _userRepository:IUserRepository,
    @inject(TYPES.IChatRepository) private _chatRepository:IChatRepository,
  ) {}

  async sendConnectionRequest(
    senderId: string,
    uniqueCode: string
  ): Promise<ConnectionDTO | null> {
    try {
      const receiver = await this._userRepository.findOne({uniqueCode: uniqueCode,
        isBlocked: false,
        isVerified: true,})

      console.log(receiver,senderId,uniqueCode)

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

      return connection ? mapConnectionToDTO(connection as unknown as PopulatedConnection) : null;
    } catch (error) {
      console.log("sendConnectionRequest error", error);
      return null;
    }
  }

  async getIncomingRequests(userId: string): Promise<ConnectionDTO[] | null> {
    try {
      const requests = await this._connectionRepository.getReceivedRequests(new Types.ObjectId(userId));
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

    return mapConnectionToDTO(connection as unknown as PopulatedConnection);
  } catch (error) {
    console.log("acceptRequest error", error);
    return null;
  }
}


  async getAllConnections(
    userId: string,
    search?: string
  ): Promise<ConnectionDTO[] | null> {
    try {
      const connections = await this._connectionRepository.getAcceptedConnections(
        new Types.ObjectId(userId),
        search
      );
      return connections ? connections.map(mapConnectionToDTO) : null;
    } catch (error) {
      console.log("getAllConnections error", error);
      return null;
    }
  }

  async getOutgoingRequests(userId: string): Promise<ConnectionDTO[] | null> {
    try {
      const requests = await this._connectionRepository.getSentRequests(new Types.ObjectId(userId));
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
      return connection ? mapConnectionToDTO(connection as unknown as PopulatedConnection) : null;
    } catch (error) {
      console.log("rejectRequest error", error);
      return null;
    }
  }
}
