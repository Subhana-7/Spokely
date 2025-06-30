import express from "express";
import { adminLogin, listMentors, listUsers } from "../controllers/admin.controller";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users",listUsers);
router.get("/mentors",listMentors);

export default router;
