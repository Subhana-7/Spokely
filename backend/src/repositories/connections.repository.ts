import ConnectionModel, { IConnection } from "../models/connections.model";
import { Types } from "mongoose";

export class ConnectionRepository {
  async createConnection(
    userId: Types.ObjectId,
    connectedUserId: Types.ObjectId
  ) {
    return await ConnectionModel.create({ userId, connectedUserId });
  }

  async findByReferralCode(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId
  ) {
    return await ConnectionModel.findOne({
      userId: senderId,
      connectedUserId: receiverId,
    });
  }

  async getReceivedRequests(userId: Types.ObjectId) {
    return await ConnectionModel.find({
      connectedUserId: userId,
      status: "pending",
    }).populate("userId");
  }

  async acceptRequest(requestId: string) {
    return await ConnectionModel.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );
  }

  async getAcceptedConnections(userId: Types.ObjectId) {
    return await ConnectionModel.find({
      status: "accepted",
      $or: [{ userId }, { connectedUserId: userId }],
    }).populate("userId connectedUserId");
  }
}
