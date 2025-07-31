export interface MentorResponseDTO {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  profilePicture?: string;
  isBlocked: boolean;
  uniqueCode: string;
  sessionsDone: number;
  isVerified: boolean;
  isGoogleUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  document?: {
    documentUrl: string;
    textMessage: string;
    verificationStatus: "pending" | "approved" | "rejected";
    rejectionReason?: string;
  };
}
