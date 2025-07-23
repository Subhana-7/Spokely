import ConnectionModel, { IConnection } from "../models/connections.model";
import { Types } from "mongoose";
import { IConnectionRepository } from "./interfaces/IConnectionsRepository";

export class ConnectionRepository implements IConnectionRepository {
  async createConnection(
    userId: Types.ObjectId,
    connectedUserId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      return await ConnectionModel.create({ userId, connectedUserId });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findByReferralCode(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      return await ConnectionModel.findOne({
        userId: senderId,
        connectedUserId: receiverId,
      });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getReceivedRequests(
    userId: Types.ObjectId
  ): Promise<IConnection[] | null> {
    try {
      return await ConnectionModel.find({
        connectedUserId: userId,
        status: "pending",
      }).populate("userId");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async acceptRequest(requestId: string): Promise<IConnection | null> {
    try {
      return await ConnectionModel.findByIdAndUpdate(
        requestId,
        { status: "accepted" },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAcceptedConnections(
    userId: Types.ObjectId
  ): Promise<IConnection[] | null> {
    try {
      return await ConnectionModel.find({
        status: "accepted",
        $or: [{ userId }, { connectedUserId: userId }],
      }).populate("userId connectedUserId");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getSentRequests(userId: Types.ObjectId): Promise<IConnection[] | null> {
    try {
      return await ConnectionModel.find({
        userId,
        status: "pending",
      }).populate("connectedUserId");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
