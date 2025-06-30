// types/express/index.d.ts or types/AuthenticatedRequest.ts
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  id?: string;
  role?: "user" | "mentor";
}
