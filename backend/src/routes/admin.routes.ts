import express from "express";
import { adminLogin, listMentors, listUsers,blockUser,deleteUser } from "../controllers/admin.controller";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users",listUsers);
router.get("/mentors",listMentors);

router.patch("/users/:id/block", blockUser);
router.delete("/users/:id", deleteUser);

router.patch("/mentors/:id/block", blockUser);
router.delete("/mentors/:id", deleteUser);  


export default router;
