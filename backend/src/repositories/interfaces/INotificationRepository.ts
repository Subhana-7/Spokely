import { CreateNotificationDTO } from "../../dto/notification.dto";
import { NotificationDocument } from "../../types/notification.types";

export interface INotificationRepository {
  create(data: CreateNotificationDTO): Promise<NotificationDocument>;
  findByUserId(userId: string): Promise<NotificationDocument[]>;
  markAsRead(id: string): Promise<void>;
}
