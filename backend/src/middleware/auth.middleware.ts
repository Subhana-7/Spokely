import jwt from "jsonwebtoken";
import { Response, NextFunction, RequestHandler } from "express";
import { MESSAGES, STATUS_CODES,ROLES,COOKIE_KEYS } from "../utilis/constants";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const token =
      req.cookies[COOKIE_KEYS.AUTH] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.UNAUTHORIZED,
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: (typeof ROLES)[keyof typeof ROLES];
        status:boolean;
      };

      if (!allowedRoles.includes(decoded.role)) {
        res.status(STATUS_CODES.FORBIDDEN).json({
          message: MESSAGES.ERROR.FORBIDDEN,
        });
        return;
      }

        if (decoded?.status === true) {
        res.status(STATUS_CODES.FORBIDDEN).json({
          message:MESSAGES.ERROR.ACCOUNT_BLOCKED,
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
