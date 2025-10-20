import { UserDTO } from "./user.dto";

export interface ConnectionDTO {
  id: string;
  user: UserDTO;
  connectedUser: UserDTO;
  status: "pending" | "accepted" | "rejected";
  sessionCount: number;
  levelsUnlocked: number;
  createdAt: Date;
  updatedAt: Date;
  isBlocked:Boolean;
  blockedBy:UserDTO;
}
