
import { IAdmin } from "../models/admin.model";
import { IUser } from "../models/user.model";
import { AdminResponseDto, UserSummaryDto } from "../dto/admin.dto";

export const mapAdminToDto = (admin: IAdmin): AdminResponseDto => {
  return {
    id: admin._id.toString(),
    email: admin.email,
    role:admin.role?? "admin"
  };
};

export const mapUserToSummaryDto = (user: IUser): UserSummaryDto => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role ?? "admin",
    isBlocked: user.isBlocked ?? false,
  };
};