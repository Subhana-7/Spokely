import ConnectionModel, { IConnection } from "../models/connections.model";
import { Types } from "mongoose";
import { IConnectionRepository } from "./interfaces/IConnectionsRepository";
import { injectable } from "inversify";
import { PopulatedConnection } from "../types/populated";
import { BaseRepository } from "./base.repository";

@injectable()
export class ConnectionRepository
  extends BaseRepository<IConnection>
  implements IConnectionRepository
{
  constructor() {
    super(ConnectionModel);
  }

  async createConnection(
    userId: Types.ObjectId,
    connectedUserId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      return await ConnectionModel.create({ userId, connectedUserId });
    } catch (error) {
      console.log("createConnection error", error);
      return null;
    }
  }

  async findByUniqueCode(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      return await ConnectionModel.findOne({
        $or: [
          { userId: senderId, connectedUserId: receiverId },
          { userId: receiverId, connectedUserId: senderId },
        ],
      });
    } catch (error) {
      console.log("findByUniqueCode error", error);
      return null;
    }
  }

  async getReceivedRequests(
    userId: Types.ObjectId
  ): Promise<PopulatedConnection[] | null> {
    try {
      return (await ConnectionModel.find({
        connectedUserId: userId,
        status: "pending",
        isBlocked: false,
        isRemoved: false,
      }).populate(
        "userId",
        "name email profilePicture"
      )) as unknown as PopulatedConnection[];
    } catch (error) {
      console.log("getReceivedRequests error", error);
      return null;
    }
  }

  async acceptRequest(
    requestId: string,
    userId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findById(requestId);
      console.log(connection);
      if (!connection) throw new Error("Connection not found");
      if (!connection.connectedUserId.equals(userId))
        throw new Error("Unauthorized action");

      connection.status = "accepted";
      await connection.save();
      return connection;
    } catch (error) {
      console.log("acceptRequest error", error);
      return null;
    }
  }

  async rejectRequest(
    requestId: string,
    userId: Types.ObjectId
  ): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findById(requestId);
      if (!connection) throw new Error("Connection not found");
      if (!connection.connectedUserId.equals(userId))
        throw new Error("Unauthorized action");

      connection.status = "rejected";
      await connection.save();
      return connection;
    } catch (error) {
      console.log("rejectRequest error", error);
      return null;
    }
  }

  async getAcceptedConnections(
    userId: Types.ObjectId,
    search?: string
  ): Promise<PopulatedConnection[] | null> {
    try {
      let query = ConnectionModel.find({
        $or: [{ userId }, { connectedUserId: userId }],
        status: "accepted",
        isRemoved: false,
      })
        .populate("userId", "name email profilePicture role uniqueCode")
        .populate(
          "connectedUserId",
          "name email profilePicture role uniqueCode"
        );

      if (search) {
        const regex = new RegExp(search, "i");
        query = query.find({
          $or: [
            { "userId.name": { $regex: regex } },
            { "userId.email": { $regex: regex } },
            { "connectedUserId.name": { $regex: regex } },
            { "connectedUserId.email": { $regex: regex } },
          ],
        });
      }

      const connections = await query.exec();
      console.log("repo", connections);
      return connections as unknown as PopulatedConnection[];
    } catch (error) {
      console.log("getAcceptedConnections error", error);
      return null;
    }
  }

  async getSentRequests(
    userId: Types.ObjectId
  ): Promise<PopulatedConnection[] | null> {
    try {
      return (await ConnectionModel.find({
        userId,
        status: "pending",
        isBlocked: false,
        isRemoved: false,
      }).populate(
        "connectedUserId",
        "name email profilePicture"
      )) as unknown as PopulatedConnection[];
    } catch (error) {
      console.log("getSentRequests error", error);
      return null;
    }
  }

  // inside ConnectionRepository

  async blockConnection(
    connectionId: string,
    userId: string
  ): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findByIdAndUpdate(
        connectionId,
        { isBlocked: true, blockedBy: userId },
        { new: true }
      );
      return connection;
    } catch (error) {
      console.log("blockConnection error", error);
      return null;
    }
  }

  async unblockConnection(connectionId: string): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findByIdAndUpdate(
        connectionId,
        {
          $set: { isBlocked: false },
          $unset: { blockedBy: "" },
        },
        { new: true }
      );
      return connection;
    } catch (error) {
      console.log("unblockConnection error", error);
      return null;
    }
  }

  async deleteConnection(connectionId: string): Promise<IConnection | null> {
      try {
        const connection = await ConnectionModel.findByIdAndDelete(connectionId);
        return connection;
      } catch (error) {
        console.log("connection deletion error", error);
      return null;
      }
  }
}
