export interface JwtPayloadWithRole {
  id: string;
  role: 'user' | 'mentor' | 'admin';
  iat: number;
  exp: number; 
}
