import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { INotificationService } from "../services/interfaces/INotificationService";
import { TYPES } from "../types/types";

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService
  ) {}

  async getUserNotifications(req: Request, res: Response) {
    const userId = req.params.userId;
    const data = await this._notificationService.getUserNotifications(userId);
    res.json({ success: true, data });
  }

  async markAsRead(req: Request, res: Response) {
    const { id } = req.params;
    await this._notificationService.markAsRead(id);
    res.json({ success: true });
  }
}
