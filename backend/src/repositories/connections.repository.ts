import ConnectionModel, { IConnection } from "../models/connections.model";
import { Types } from "mongoose";
import { IConnectionRepository } from "./interfaces/IConnectionsRepository";
import { injectable } from "inversify";
import { PopulatedConnection } from "../types/populated";

@injectable()
export class ConnectionRepository implements IConnectionRepository {
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

  async getReceivedRequests(userId: Types.ObjectId): Promise<PopulatedConnection[] | null> {
    try {
      return (await ConnectionModel.find({
        connectedUserId: userId,
        status: "pending",
        isBlocked: false,
        isRemoved: false,
      }).populate("userId", "name email profilePicture")) as unknown as PopulatedConnection[];
    } catch (error) {
      console.log("getReceivedRequests error", error);
      return null;
    }
  }

  async acceptRequest(requestId: string, userId: Types.ObjectId): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findById(requestId);
      if (!connection) throw new Error("Connection not found");
      if (!connection.connectedUserId.equals(userId)) throw new Error("Unauthorized action");

      connection.status = "accepted";
      await connection.save();
      return connection;
    } catch (error) {
      console.log("acceptRequest error", error);
      return null;
    }
  }

  async rejectRequest(requestId: string, userId: Types.ObjectId): Promise<IConnection | null> {
    try {
      const connection = await ConnectionModel.findById(requestId);
      if (!connection) throw new Error("Connection not found");
      if (!connection.connectedUserId.equals(userId)) throw new Error("Unauthorized action");

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
    const match: any = {
      status: "accepted",
      isBlocked: false,
      isRemoved: false,
      $or: [{ userId }, { connectedUserId: userId }],
    };

    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ["$userId", userId] },
              "$connectedUserId",
              "$userId",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "otherUserId",
          foreignField: "_id",
          as: "connectionWith",
        },
      },
      { $unwind: "$connectionWith" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "connectionWith.name": { $regex: search, $options: "i" } },
            { "connectionWith.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const connections = await ConnectionModel.aggregate(pipeline);
    return connections as PopulatedConnection[];
  } catch (error) {
    console.log("getAcceptedConnections error", error);
    return null;
  }
}



  async getSentRequests(userId: Types.ObjectId): Promise<PopulatedConnection[] | null> {
    try {
      return (await ConnectionModel.find({
        userId,
        status: "pending",
        isBlocked: false,
        isRemoved: false,
      }).populate("connectedUserId", "name email profilePicture")) as unknown as PopulatedConnection[];
    } catch (error) {
      console.log("getSentRequests error", error);
      return null;
    }
  }
}

