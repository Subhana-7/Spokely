import { ConnectionRepository } from "../repositories/connections.repository";
import UserModel from "../models/user.model";
import { Types } from "mongoose";

export class ConnectionService {
  private repo = new ConnectionRepository();

  async sendConnectionRequest(senderId: string, referralCode: string) {
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
  }

  async getIncomingRequests(userId: string) {
    return await this.repo.getReceivedRequests(new Types.ObjectId(userId));
  }

  async acceptRequest(requestId: string) {
    return await this.repo.acceptRequest(requestId);
  }

  async getAllConnections(userId: string) {
    return await this.repo.getAcceptedConnections(new Types.ObjectId(userId));
  }

  async getOutgoingRequests(userId: string) {
    return await this.repo.getSentRequests(new Types.ObjectId(userId));
  }
}
