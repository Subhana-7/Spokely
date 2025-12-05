export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "mentor" | "admin";
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}
export interface UserProfileResponse {
  user: UserProfile;
}
