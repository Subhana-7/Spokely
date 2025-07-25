export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  phone?: number;
  role?: "user" | "mentor";
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

export interface UserResponseDTO {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  role: "user" | "mentor";
  profilePicture?: string;
  isBlocked: boolean;
  referalCode: string;
  levels?: number;
  completionRate?: number;
  streak?: number;
  sessionsDone: number;
  isVerified: boolean;
  isGoogleUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: "user" | "mentor";
  referalCode: string;
}
