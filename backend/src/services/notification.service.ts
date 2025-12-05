import { inject, injectable } from "inversify";
import { INotificationService } from "./interfaces/INotificationService";
import { INotificationRepository } from "../repositories/interfaces/INotificationRepository";
import { TYPES } from "../types/types";
import { Server } from "socket.io";
import { NotificationDocument } from "../types/notification.types";
import {
  CreateNotificationDTO,
  NotificationDTO,
} from "../dto/notification.dto";
import { NotificationMapper } from "../mappers/notification.mapper";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.INotificationRepository)
    private _notificationRepository: INotificationRepository,
    @inject(TYPES.SocketIO)
    private io: Server
  ) {}

  async send(data: CreateNotificationDTO): Promise<NotificationDTO> {
    const noti = await this._notificationRepository.create(data);
    const dto = NotificationMapper.toDTO(noti);
    // this.io.to(data.userId).emit("notification", dto);
    console.log("after spcket", dto);
    return dto;
  }

  async getUserNotifications(userId: string): Promise<NotificationDTO[]> {
    const list = await this._notificationRepository.findByUserId(userId);
    return NotificationMapper.toDTOList(list);
  }

  async markAsRead(id: string) {
    await this._notificationRepository.markAsRead(id);
  }
}
