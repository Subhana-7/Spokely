import express from "express";
import { AdminController } from "../controllers/admin.controller";

const router = express.Router();
const controller = new AdminController();

router.post("/login", controller.adminLogin);
router.get("/users",controller.listUsers);
router.get("/mentors",controller.listMentors);

router.patch("/users/:id/block", controller.blockUser);
router.delete("/users/:id", controller.deleteUser);

router.patch("/mentors/:id/block", controller.blockUser);
router.delete("/mentors/:id", controller.deleteUser);  


export default router;
