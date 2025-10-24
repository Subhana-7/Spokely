import { NotificationDTO } from "../dto/notification.dto";
import { NotificationDocument } from "../types/notification.types";

export class NotificationMapper {
  static toDTO(doc: NotificationDocument): NotificationDTO {
    return {
      id: doc._id.toString(),
      userId: doc.userId?.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
    };
  }

  static toDTOList(docs: NotificationDocument[]): NotificationDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
