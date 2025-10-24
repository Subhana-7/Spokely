import { Response, Request } from "express";
import { NotificationDocument } from "../../types/notification.types";

export interface INotificationController {
  getUserNotifications(req: Request, res: Response): Promise<void>;

  markAsRead(req: Request, res: Response): Promise<void>;
}
