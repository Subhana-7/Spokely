import jwt from "jsonwebtoken";
import { Response, NextFunction, RequestHandler } from "express";
import { MESSAGES, STATUS_CODES } from "../utilis/constants";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {

    const token =
      req.cookies["auth-token"] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.UNAUTHORIZED,
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: "user" | "mentor";
      };

      if (!allowedRoles.includes(decoded.role)) {
        res.status(STATUS_CODES.FORBIDDEN).json({
          message: MESSAGES.ERROR.FORBIDDEN,
        });
        return;
      }

      (req as AuthenticatedRequest).id = decoded.id;
      (req as AuthenticatedRequest).role = decoded.role;
      next();
    } catch (err) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.INVALID_TOKEN,
      });
    }
  };
};
