import { Container } from "inversify";
import { TYPES } from "../types/types";

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

container.bind<IMentorPlanRepository>(TYPES.IMentorPlanRepository).to(MentorPlanRepository);

container.bind<ISubscriptionController>(TYPES.ISubscriptionController).to(SubscriptionController);
container.bind<ISubscriptionService>(TYPES.ISubscriptionService).to(SubscriptionService);
container.bind<ISubscriptionRepository>(TYPES.ISubscriptionRepository).to(SubscriptionRepository);


container.bind<IEmailService>(TYPES.IEmailService).to(EmailService)

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
