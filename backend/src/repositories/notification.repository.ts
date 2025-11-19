import { injectable } from "inversify";
import { NotificationModel } from "../models/notification.model";
import { INotificationRepository } from "./interfaces/INotificationRepository";
import { NotificationDocument } from "../types/notification.types";
import { Types } from "mongoose";
import { CreateNotificationDTO } from "../dto/notification.dto";

@injectable()
export class NotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationDTO): Promise<NotificationDocument> {
    const noti = new NotificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
    return noti.save();
  }

  async findByUserId(userId: string): Promise<NotificationDocument[]> {
    return (await NotificationModel.find({
      userId: new Types.ObjectId(userId),
    }).sort({ createdAt: -1 })) as NotificationDocument[];
  }

  async markAsRead(id: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(id, { isRead: true });
  }
}
