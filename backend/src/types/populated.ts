import { IUser } from "../models/user.model";
import { IConnection } from "../models/connections.model";
import { HydratedDocument, Types } from "mongoose";

export type PopulatedConnection = HydratedDocument<
  Omit<IConnection, "userId" | "connectedUserId"> & {
    _id: Types.ObjectId;
    userId: IUser;
    connectedUserId: IUser;
  }
>;
