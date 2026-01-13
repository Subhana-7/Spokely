export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  phone?: number;
  role?: "user" | "mentor";
  document?: {
    documentUrl: string;
    textMessage: string;
    verificationStatus: "pending" | "approved" | "rejected";
    rejectionReason?: string;
  };
}

export interface MentorSignupDTO {
  name: string;
  email: string;
  phone: number;
  password: string;
  documentUrl: string;
  textMessage: string;
  uniqueCode?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SendOtpDTO {
  email: string;
}

export interface VerifyOtpDTO {
  email: string;
  code: string;
}

export interface UpdateRoleDTO {
  role: "user" | "mentor";
}

export interface ForgotPasswordDTO {
  email: string;
  newPassword?: string;
}

export interface ChangePasswordDTO {
  id: string;
  currentPassword: string;
  newPassword?: string;
}

export interface VerifyForgotPasswordDTO {
  email: string;
  code: string;
}

export interface MentorResponseDTO {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  role: "user" | "mentor";
  profilePicture?: string;
  isBlocked: boolean;
  uniqueCode: string;
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
  bio?: string;
  tags?: string[];
}

export interface MentorDTO {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: "user" | "mentor";
  uniqueCode: string;
  createdAt?: Date;
  bio?: string;
  tags?: string;
  sessionsDone?: number;
}

export interface MentorUpdateDTO {
  name: string;
  email: string;
  phone: number;
  bio: string;
  tags: string[];
  profilePicture: string;
}
