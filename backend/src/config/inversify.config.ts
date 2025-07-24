import { Container } from "inversify";
import { TYPES } from "../types/types";

import { IAdminController } from "../controllers/interfaces/IAdminController";
import { AdminController } from "../controllers/admin.controller";

import { IAdminService } from "../services/interfaces/IAdminService";
import { AdminService } from "../services/admin.service";

import { IAdminRepository } from "../repositories/interfaces/IAdminRepository";
import { AdminRepository } from "../repositories/admin.repository";

const container = new Container();

container.bind<IAdminController>(TYPES.IAdminController).to(AdminController);
container.bind<IAdminService>(TYPES.IAdminService).to(AdminService);
container.bind<IAdminRepository>(TYPES.IAdminRepository).to(AdminRepository);

export default container;
