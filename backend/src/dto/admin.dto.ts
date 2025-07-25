export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminResponseDto {
  id: string;
  email: string;
}

export interface UserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}