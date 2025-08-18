import { IMentor } from "../models/mentor.model";
import { MentorResponseDTO, MentorDTO } from "../dto/mentor.dto";

export const toMentorResponseDTO = (mentor: IMentor): MentorResponseDTO => ({
  _id: mentor._id.toString(),
  name: mentor.name,
  email: mentor.email,
  phone: mentor.phone,
  role: mentor.role ?? "mentor",
  profilePicture: mentor.profilePicture,
  isBlocked: mentor.isBlocked,
  uniqueCode: mentor.uniqueCode,
  isVerified: mentor.isVerified,
  isGoogleUser: mentor.isGoogleUser,
  createdAt: mentor.createdAt,
  updatedAt: mentor.updatedAt,
  document: mentor.document
    ? {
        documentUrl: mentor.document.documentUrl,
        textMessage: mentor.document.textMessage,
        verificationStatus: mentor.document.verificationStatus,
        rejectionReason: mentor.document.rejectionReason,
      }
    : undefined,
  bio: mentor.bio,
  tags: mentor.tags,
});

export const toMentorDTO = (mentor: IMentor): MentorDTO => ({
  id: mentor._id.toString(),
  name: mentor.name,
  email: mentor.email,
  profilePicture: mentor.profilePicture,
  role: mentor.role ?? "mentor",
  uniqueCode: mentor.uniqueCode,
});
