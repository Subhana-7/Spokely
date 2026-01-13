export interface SendForgotPasswordOtpDTO {
  email: string;
}

export interface VerifyForgotPasswordOtpDTO {
  email: string;
  code: string;
}

export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: "user" | "mentor";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  _id?: string;
  id?:string;
  name: string;
  email: string;
  phone?: number;
  role?: "user" | "mentor";
  profilePicture?: string;
  isBlocked: boolean;
  uniqueCode?: string;
  levels?: number;
  completionRate?: number;
  streak?: number;
  sessionsDone: number;
  isVerified: boolean;
  isGoogleUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  mentorsSubscribed?:unknown;
  totalConnections?:unknown;
  dailyTasksCompleted?:unknown;
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

export interface changePasswordDTO {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role?: "user" | "mentor";
  uniqueCode?: string;
}

export interface MentorDTO {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  uniqueCode: string;
  sessionsDone: number;
  tags: string;
  createdAt: Date;
}

export interface GoogleProfile {
  id: string;
  displayName?: string;
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
}

