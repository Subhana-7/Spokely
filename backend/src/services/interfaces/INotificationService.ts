import {
  CreateNotificationDTO,
  NotificationDTO,
} from "../../dto/notification.dto";
import { NotificationDocument } from "../../types/notification.types";

export interface INotificationService {
  send(data: CreateNotificationDTO): Promise<NotificationDTO>;
  getUserNotifications(userId: string): Promise<NotificationDTO[]>;
  markAsRead(id: string): Promise<void>;
}
