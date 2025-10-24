export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "success";
}

export interface UpdateNotificationDTO {
  isRead?: boolean;
}
