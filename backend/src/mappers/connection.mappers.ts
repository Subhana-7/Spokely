import { ConnectionDTO } from "../dto/connection.dto";
import { toUserDTO } from "./user.mapper";

import { PopulatedConnection } from "../types/populated";

export const mapConnectionToDTO = (
  connection: PopulatedConnection
): ConnectionDTO => {
  return {
    id: connection._id.toString(),
    user: toUserDTO(connection.userId),
    connectedUser: toUserDTO(connection.connectedUserId),
    status: connection.status,
    sessionCount: connection.sessionCount,
    levelsUnlocked: connection.levelsUnlocked,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    isBlocked:connection.isBlocked,
    blockedBy:toUserDTO(connection.userId),
  };
};
