import { Request,Response } from "express";
import { UserService } from "../services/user.service";

const service = new UserService();

export const signup = async(req:Request, res:Response) => {
  try{
    const user = await service.signup(req.body);
    res.status(201).json(user);
  }catch(err:any){
    res.status(400).json({message:err.message});
  }
};

export const login = async(req:Request,res:Response) => {
  try{
    const result = await service.login(req.body);
    res.status(200).json(result);
  }catch(err:any){
    res.status(400).json({message:err.message});
  }
}