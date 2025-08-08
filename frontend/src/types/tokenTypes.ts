export interface JwtPayloadWithRole {
  id: string;
  role: 'user' | 'mentor' | 'admin'; // adjust if you have different roles
  iat: number; // issued at
  exp: number; // expiration time
}
