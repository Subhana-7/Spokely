import Admin, { IAdmin } from "../models/admin.model";
import User, { IUser } from "../models/user.model";
import { IAdminRepository } from "./interfaces/IAdminRepository";
import { injectable } from "inversify";
import Mentor, { IMentor } from "../models/mentor.model";
import { BaseRepository } from "./base.repository";

@injectable()
export class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      return Admin.findOne({ email });
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findAllUsers(): Promise<IUser[] | null> {
    try {
      return User.find({ isVerified: true });
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findAllMentors(): Promise<IMentor[] | null> {
    try {
      return Mentor.find({ isVerified: true });
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async blockUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  }

  async unblockUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  }

  async blockMentor(id: string): Promise<IUser | null> {
    return Mentor.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  }

  async unblockMentor(id: string): Promise<IUser | null> {
    return Mentor.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  }

  async getMentor(id: string): Promise<IMentor[] | null> {
    try {
      let result = await Mentor.find({
        _id: id,
        isVerified: true,
      });
      return result;
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateMentor(id: string): Promise<IMentor | null> {
    try {
      let res = await Mentor.findByIdAndUpdate(
        id,
        { "document.verificationStatus": "approved" },
        { new: true }
      );
      return res;
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateMentorRejection(
    id: string,
    reason: string
  ): Promise<IMentor | null> {
    try {
      let res = await Mentor.findByIdAndUpdate(
        id,
        {
          "document.verificationStatus": "rejected",
          "document.rejectionReason": reason,
        },
        { new: true }
      );
      return res;
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findAllUsersWithQuery({
    page = 1,
    limit = 10,
    search = "",
    level,
    minSessions,
    maxSessions,
    minMentors,
    maxMentors,
    isBlocked,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    minSessions?: number;
    maxSessions?: number;
    minMentors?: number;
    maxMentors?: number;
    isBlocked: boolean;
  }): Promise<{ users: IUser[]; total: number }> {
    const query: any = {
      isVerified: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (level && level !== "All Levels") {
      query.levels = level;
    }

    if (minSessions !== undefined || maxSessions !== undefined) {
      query.sessionsDone = {};
      if (minSessions !== undefined) query.sessionsDone.$gte = minSessions;
      if (maxSessions !== undefined) query.sessionsDone.$lte = maxSessions;
    }

    if (minMentors !== undefined || maxMentors !== undefined) {
      query.mentors = {};
      if (minMentors !== undefined) query.mentors.$gte = minMentors;
      if (maxMentors !== undefined) query.mentors.$lte = maxMentors;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked;
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query).skip(skip).limit(limit);
    const total = await User.countDocuments(query);

    return { users, total };
  }

  async findAllMentorsWithQuery({
    page = 1,
    limit = 10,
    search = "",
    sortBy,
    verificationStatus,
    isBlocked,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "students" | "sessions";
    verificationStatus?: "pending" | "approved" | "rejected";
    isBlocked?: boolean;
  }): Promise<{ mentors: IMentor[]; total: number }> {
    const query: any = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (verificationStatus) {
      query["document.verificationStatus"] = verificationStatus;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked;
    }

    const skip = (page - 1) * limit;

    let sort: any = {};
    if (sortBy === "students") sort.studentsCount = -1;
    else if (sortBy === "sessions") sort.sessionsDone = -1;

    const mentors = await Mentor.find(query).sort(sort).skip(skip).limit(limit);

    const total = await Mentor.countDocuments(query);

    return { mentors, total };
  }

 async findAllMentorsPaginated(
  query: any,
  options: { page: number; limit: number }
) {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const results = await Mentor.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await Mentor.countDocuments(query);

  return { results, total };
}
}
