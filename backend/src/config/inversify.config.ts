import { Container } from "inversify";
import { TYPES } from "../types/types";
import { Server } from "socket.io";

import { NotificationController } from "../controllers/notification.controller";
import { INotificationController } from "../controllers/interfaces/INotificationController";

import { NotificationService } from "../services/notification.service";
import { INotificationService } from "../services/interfaces/INotificationService";

import { NotificationRepository } from "../repositories/notification.repository";
import { INotificationRepository } from "../repositories/interfaces/INotificationRepository";

import { IWalletService } from "../services/interfaces/IWalletService";
import { WalletService } from "../services/wallet.service";

import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { WalletRepository } from "../repositories/wallet.repository";

import { DailyTaskController } from "../controllers/daily.task.controller";
import { IDailyTaskController } from "../controllers/interfaces/IDailyTaskController";

import { DailyTaskService } from "../services/daily.task.service";
import { IDailyTaskService } from "../services/interfaces/IDailyTaskService";

import { DailyTaskRepository } from "../repositories/daily.task.repository";
import { IDailyTaskRepository } from "../repositories/interfaces/IDailyTaskRepository";

import { IBaseRepository } from "../repositories/interfaces/IBaseRepository";
import { BaseRepository } from "../repositories/base.repository";

import { PaymentRepository } from "../repositories/payment.repository";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";

import { IPaymentService } from "../services/interfaces/IPaymentService";
import { PaymentService } from "../services/payment.service";

import { IPaymentController } from "../controllers/interfaces/IPaymentController";
import { PaymentController } from "../controllers/payment.controller";

import { IChatController } from "../controllers/interfaces/IChatController";
import { ChatController } from "../controllers/chat.controller";

import { IChatService } from "../services/interfaces/IChatService";
import { ChatService } from "../services/chat.service";

import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { ChatRepository } from "../repositories/chat.repository";

import { IMentorPlanRepository } from "../repositories/interfaces/IMentorPlanRepository";
import { MentorPlanRepository } from "../repositories/mentorPlan.repository";

import { ISubscriptionController } from "../controllers/interfaces/ISubscriptionController";
import { SubscriptionController } from "../controllers/subscription.controller";

import { ISubscriptionService } from "../services/interfaces/ISubscriptionService";
import { SubscriptionService } from "../services/subscription.service";

import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import { SubscriptionRepository } from "../repositories/subscription.repository";

import { IEmailService } from "../services/interfaces/IEmailService";
import { EmailService } from "../services/email.service";

import { ISessionController } from "../controllers/interfaces/ISessionController";
import { SessionController } from "../controllers/session.controller";

import { ISessionService } from "../services/interfaces/ISessionService";
import { SessionService } from "../services/session.service";

import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { SessionRepository } from "../repositories/session.repository";

import { IConnectionController } from "../controllers/interfaces/IConnectionsController";
import { ConnectionController } from "../controllers/connections.controller";

import { IConnectionService } from "../services/interfaces/IConnectionsService";
import { ConnectionService } from "../services/connections.service";

import { IConnectionRepository } from "../repositories/interfaces/IConnectionsRepository";
import { ConnectionRepository } from "../repositories/connections.repository";

import { IUserController } from "../controllers/interfaces/IUserController";
import { UserController } from "../controllers/user.controller";

import { IUserService } from "../services/interfaces/IUserService";
import { UserService } from "../services/user.service";

import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { UserRepository } from "../repositories/user.repository";

import { IMentorController } from "../controllers/interfaces/IMentorController";
import { MentorController } from "../controllers/mentor.controller";

import { IMentorService } from "../services/interfaces/IMentorService";
import { MentorService } from "../services/mentor.service";

import { IMentorRepository } from "../repositories/interfaces/IMentorRepository";
import { MentorRepository } from "../repositories/mentor.repository";

import { IAdminController } from "../controllers/interfaces/IAdminController";
import { AdminController } from "../controllers/admin.controller";

import { IAdminService } from "../services/interfaces/IAdminService";
import { AdminService } from "../services/admin.service";

import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { AdminRepository } from "../repositories/admin.repository";

const container = new Container();

container.bind<Server>(TYPES.SocketIO).toConstantValue({} as Server);

container
  .bind<INotificationController>(TYPES.INotificationController)
  .to(NotificationController);
container
  .bind<INotificationService>(TYPES.INotificationService)
  .to(NotificationService);
container
  .bind<INotificationRepository>(TYPES.INotificationRepository)
  .to(NotificationRepository);

container.bind<IWalletService>(TYPES.IWalletService).to(WalletService);
container.bind<IWalletRepository>(TYPES.IWalletRepository).to(WalletRepository);

container
  .bind<IDailyTaskController>(TYPES.IDailyTaskController)
  .to(DailyTaskController);
container.bind<IDailyTaskService>(TYPES.IDailyTaskService).to(DailyTaskService);
container
  .bind<IDailyTaskRepository>(TYPES.IDailyTaskRepository)
  .to(DailyTaskRepository);

// container.bind<IBaseRepository>(TYPES.IBaseRepository).to(BaseRepository);

container
  .bind<IPaymentController>(TYPES.IPaymentController)
  .to(PaymentController);
container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService);
container
  .bind<IPaymentRepository>(TYPES.IPaymentRepository)
  .to(PaymentRepository);

container.bind<IChatController>(TYPES.IChatController).to(ChatController);
container.bind<IChatService>(TYPES.IChatService).to(ChatService);
container.bind<IChatRepository>(TYPES.IChatRepository).to(ChatRepository);

container
  .bind<IMentorPlanRepository>(TYPES.IMentorPlanRepository)
  .to(MentorPlanRepository);

container
  .bind<ISubscriptionController>(TYPES.ISubscriptionController)
  .to(SubscriptionController);
container
  .bind<ISubscriptionService>(TYPES.ISubscriptionService)
  .to(SubscriptionService);
container
  .bind<ISubscriptionRepository>(TYPES.ISubscriptionRepository)
  .to(SubscriptionRepository);

container.bind<IEmailService>(TYPES.IEmailService).to(EmailService);

container
  .bind<ISessionController>(TYPES.ISessionController)
  .to(SessionController);
container.bind<ISessionService>(TYPES.ISessionService).to(SessionService);
container
  .bind<ISessionRepository>(TYPES.ISessionRepository)
  .to(SessionRepository);

container
  .bind<IConnectionController>(TYPES.IConnectionController)
  .to(ConnectionController);
container
  .bind<IConnectionService>(TYPES.IConnectionService)
  .to(ConnectionService);
container
  .bind<IConnectionRepository>(TYPES.IConnectionRepository)
  .to(ConnectionRepository);

container.bind<IUserController>(TYPES.IUserController).to(UserController);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

container.bind<IMentorController>(TYPES.IMentorController).to(MentorController);
container.bind<IMentorService>(TYPES.IMentorService).to(MentorService);
container.bind<IMentorRepository>(TYPES.IMentorRepository).to(MentorRepository);

container.bind<IAdminController>(TYPES.IAdminController).to(AdminController);
container.bind<IAdminService>(TYPES.IAdminService).to(AdminService);
container.bind<IAdminRepository>(TYPES.IAdminRepository).to(AdminRepository);

export default container;
