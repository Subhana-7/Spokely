import { IMentor } from "../models/mentor.model";
import { MentorResponseDTO } from "../dto/mentor.dto";

export const toMentorResponseDTO = (mentor: IMentor): MentorResponseDTO => ({
  _id: mentor._id.toString(),
  name: mentor.name,
  email: mentor.email,
  phone: mentor.phone,
  profilePicture: mentor.profilePicture,
  isBlocked: mentor.isBlocked,
  uniqueCode: mentor.uniqueCode,
  sessionsDone: mentor.sessionsDone,
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
});
