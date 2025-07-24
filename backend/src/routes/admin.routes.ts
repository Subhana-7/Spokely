import express from "express";
import { IAdminController } from "../controllers/interfaces/IAdminController";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";

const router = express.Router();
const controller = container.get<IAdminController>(TYPES.IAdminController);

router.post("/login", controller.adminLogin.bind(controller));
router.get("/users", controller.listUsers.bind(controller));
router.get("/mentors", controller.listMentors.bind(controller));

router.patch("/users/:id/block", controller.blockUser.bind(controller));
// router.delete("/users/:id", controller.deleteUser.bind(controller));

router.patch("/mentors/:id/block", controller.blockUser.bind(controller));
// router.delete("/mentors/:id", controller.deleteUser.bind(controller));

export default router;