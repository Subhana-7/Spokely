import { MentorResponseDTO } from "../dto/mentor.dto";
import { UserDTO, UserResponseDTO } from "../dto/user.dto";
import { IMentor } from "../models/mentor.model";
import { IUser } from "../models/user.model";

export const toUserResponseDTO = (user: IUser): UserResponseDTO => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role ?? "user",
    profilePicture: user.profilePicture,
    isBlocked: user.isBlocked,
    uniqueCode: user.uniqueCode ?? "",
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

export const toUserDTO = (user: IUser): UserDTO => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
  role: user.role ?? "user",
  uniqueCode: user.uniqueCode ?? "",
});
