import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AdminService } from "../services/admin.service";
import { error } from "console";

const service = new AdminService();

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await service.login(email, password);

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const listUsers = async(req:Request,res:Response) => {
  try{
    const users = await service.getAllUsers();
    res.status(200).json(users);
  }catch(err:any){
    res.status(500).json({error:err.message});
  }
}

export const listMentors = async(req:Request,res:Response) => {
  try{
    const mentors = await service.getAllMentors();
    res.status(200).json(mentors)
  }catch(err:any){
    res.status(500).json({error:err.message});
  }
}
