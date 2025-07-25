import { IUser } from "../models/user.model";
import { UserResponseDTO } from "../dto/user.dto";

export const toUserResponseDTO = (user: IUser): UserResponseDTO => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profilePicture: user.profilePicture,
    isBlocked: user.isBlocked,
    referalCode: user.referalCode,
    levels: user.levels,
    completionRate: user.completionRate,
    streak: user.streak,
    sessionsDone: user.sessionsDone,
    isVerified: user.isVerified,
    isGoogleUser: user.isGoogleUser,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};