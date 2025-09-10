import UserModel from "../models/user.model";
import { Types } from "mongoose";
import { IConnectionService } from "./interfaces/IConnectionsService";
import { IConnection } from "../models/connections.model";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";
import { IConnectionRepository } from "../repositories/interfaces/IConnectionsRepository";
import { PopulatedConnection } from "../types/populated";
import { ConnectionDTO } from "../dto/connection.dto";
import { mapConnectionToDTO } from "../mappers/connection.mappers";

@injectable()
export class ConnectionService implements IConnectionService {
  constructor(
    @inject(TYPES.IConnectionRepository) private repo: IConnectionRepository
  ) {}

  async sendConnectionRequest(
    senderId: string,
    uniqueCode: string
  ): Promise<ConnectionDTO | null> {
    try {
      const receiver = await UserModel.findOne({
        uniqueCode: uniqueCode,
        isBlocked: false,
        isVerified: true,
      });

      if (!receiver) throw new Error("User not found or not verified");
      if (receiver._id.equals(senderId))
        throw new Error("You can't connect with yourself");

      const existing = await this.repo.findByUniqueCode(
        new Types.ObjectId(senderId),
        receiver._id
      );

      if (existing) throw new Error("Connection already exists");

      const connection = await this.repo.createConnection(
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
      const requests = await this.repo.getReceivedRequests(new Types.ObjectId(userId));
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
      const connection = await this.repo.acceptRequest(
        requestId,
        new Types.ObjectId(userId)
      );
      return connection ? mapConnectionToDTO(connection as unknown as PopulatedConnection) : null;
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
      const connections = await this.repo.getAcceptedConnections(
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
      const requests = await this.repo.getSentRequests(new Types.ObjectId(userId));
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
      const connection = await this.repo.rejectRequest(
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
