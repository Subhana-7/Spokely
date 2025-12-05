export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminResponseDto {
  id: string;
  email: string;
  role: "user" | "mentor" | "admin";
}

export interface UserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  levels?:number;
  profilePicture?:string;
  sessionsDone:number;
}
