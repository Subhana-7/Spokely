import { ConnectionRepository } from "../repositories/connections.repository";
import UserModel from "../models/user.model";
import { Types } from "mongoose";
import { IConnectionService } from "./interfaces/IConnectionsService";
import { IConnection } from "../models/connections.model";
import { TYPES } from "../types/types";
import { inject,injectable } from "inversify";
import { IConnectionRepository } from "../repositories/interfaces/IConnectionsRepository";

@injectable()
export class ConnectionService implements IConnectionService {
  constructor(
    @inject(TYPES.IConnectionRepository) private repo: IConnectionRepository
  ) {}

  async sendConnectionRequest(
    senderId: string,
    referralCode: string
  ): Promise<IConnection | null> {
    try {
      const receiver = await UserModel.findOne({ referalCode: referralCode });
      if (!receiver) throw new Error("User with referral code not found");
      if (receiver._id.equals(senderId))
        throw new Error("You can't connect with yourself");

      const existing = await this.repo.findByReferralCode(
        new Types.ObjectId(senderId),
        receiver._id
      );
      if (existing) throw new Error("Connection already exists");

      return await this.repo.createConnection(
        new Types.ObjectId(senderId),
        receiver._id
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getIncomingRequests(userId: string): Promise<IConnection[] | null> {
    try {
      return await this.repo.getReceivedRequests(new Types.ObjectId(userId));
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async acceptRequest(requestId: string): Promise<IConnection | null> {
    try {
      return await this.repo.acceptRequest(requestId);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAllConnections(userId: string): Promise<IConnection[] | null> {
    try {
      return await this.repo.getAcceptedConnections(new Types.ObjectId(userId));
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getOutgoingRequests(userId: string): Promise<IConnection[] | null> {
    try {
      return await this.repo.getSentRequests(new Types.ObjectId(userId));
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
