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



  async findWithFilters(
  userId: string,
  filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<PopulatedConnection[]> {
  try {
    const { search = "", status = "all", page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const userObjId = new Types.ObjectId(userId);

    // Base query
    const baseQuery: any = {
      isRemoved: false,
      $or: [{ userId: userObjId }, { connectedUserId: userObjId }],
    };

    // Status filters
    if (status === "accepted") {
      baseQuery.status = "accepted";
      baseQuery.isBlocked = false; // accepted shouldn't be blocked
    } else if (status === "pending_sent") {
      baseQuery.userId = userObjId;
      baseQuery.status = "pending";
    } else if (status === "pending_received") {
      baseQuery.connectedUserId = userObjId;
      baseQuery.status = "pending";
    } else if (status === "blocked") {
      baseQuery.isBlocked = true;
    }

    // If there's a search term, use aggregation pipeline
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");

      const pipeline: any[] = [
        { $match: baseQuery },
        // Lookup blockedBy user
        {
          $lookup: {
            from: "users",
            localField: "blockedBy",
            foreignField: "_id",
            as: "blockedByUser",
          },
        },
        // Lookup userId
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDoc",
          },
        },
        { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
        // Lookup connectedUserId
        {
          $lookup: {
            from: "users",
            localField: "connectedUserId",
            foreignField: "_id",
            as: "connectedUserDoc",
          },
        },
        { $unwind: { path: "$connectedUserDoc", preserveNullAndEmptyArrays: true } },
        // Search filter
        {
          $match: {
            $or: [
              { "userDoc.name": { $regex: regex } },
              { "userDoc.email": { $regex: regex } },
              { "connectedUserDoc.name": { $regex: regex } },
              { "connectedUserDoc.email": { $regex: regex } },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        // Project to match PopulatedConnection structure
        {
          $project: {
            _id: 1,
            userId: "$userDoc",
            connectedUserId: "$connectedUserDoc",
            status: 1,
            isBlocked: 1,
            blockedBy: { $arrayElemAt: ["$blockedByUser", 0] },
            sessionCount: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const results = await ConnectionModel.aggregate(pipeline);
      return results as PopulatedConnection[];
    }

    // No search: use regular populate
    const results = await ConnectionModel.find(baseQuery)
      .populate("userId", "name email profilePicture role uniqueCode isBlocked")
      .populate("connectedUserId", "name email profilePicture role uniqueCode isBlocked")
      .populate("blockedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return results as unknown as PopulatedConnection[];
  } catch (error) {
    console.log("findWithFilters error", error);
    return [];
  }
}

async countWithFilters(
  userId: string,
  filters?: {
    search?: string;
    status?: string;
  }
): Promise<number> {
  try {
    const { search = "", status = "all" } = filters || {};
    const userObjId = new Types.ObjectId(userId);

    const baseQuery: any = {
      isRemoved: false,
      $or: [{ userId: userObjId }, { connectedUserId: userObjId }],
    };

    if (status === "accepted") {
      baseQuery.status = "accepted";
      baseQuery.isBlocked = false;
    } else if (status === "pending_sent") {
      baseQuery.userId = userObjId;
      baseQuery.status = "pending";
    } else if (status === "pending_received") {
      baseQuery.connectedUserId = userObjId;
      baseQuery.status = "pending";
    } else if (status === "blocked") {
      baseQuery.isBlocked = true;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      const pipeline: any[] = [
        { $match: baseQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDoc",
          },
        },
        { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "connectedUserId",
            foreignField: "_id",
            as: "connectedUserDoc",
          },
        },
        { $unwind: { path: "$connectedUserDoc", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { "userDoc.name": { $regex: regex } },
              { "userDoc.email": { $regex: regex } },
              { "connectedUserDoc.name": { $regex: regex } },
              { "connectedUserDoc.email": { $regex: regex } },
            ],
          },
        },
        { $count: "count" },
      ];

      const res = await ConnectionModel.aggregate(pipeline);
      return res.length ? res[0].count : 0;
    }

    return await ConnectionModel.countDocuments(baseQuery);
  } catch (error) {
    console.log("countWithFilters error", error);
    return 0;
  }
}
}
