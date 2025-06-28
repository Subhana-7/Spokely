import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const service = new UserService();

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await service.signup(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    await service.sendOtp(req.body.email);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const result = await service.verifyOtp(email, code);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
