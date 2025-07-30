import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types/types";
import { IMentorService } from "../services/interfaces/IMentorService";
import { IMentorController } from "./interfaces/IMentorController";
import { toMentorResponseDTO } from "../mappers/mentor.mapper";

@injectable()
export class MentorController implements IMentorController {
  constructor(@inject(TYPES.IMentorService) private service: IMentorService) {}

  signup = async (req: Request, res: Response) => {
    const mentor = await this.service.signup(req.body);
    const dto = toMentorResponseDTO(mentor!);
    res.status(201).json(dto);
  };

  login = async (req: Request, res: Response) => {
    console.log("mentor login controller")
    const result = await this.service.login(req.body);
    if (!result) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const { mentor, token } = result;

    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
      sameSite: "lax",
    });

    const dto = toMentorResponseDTO(mentor);
    res.status(200).json({ mentor: dto });
  };

  sendOtp = async (req: Request, res: Response) => {
    await this.service.sendOtp(req.body.email);
    res.status(200).json({ message: "OTP sent" });
  };

  verifyOtp = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    const result = await this.service.verifyOtp(email, code);
    res.status(200).json(result);
  };

  getAll = async (req: Request, res: Response) => {
    const mentors = await this.service.getAllMentors();
    const dto = mentors!.map(toMentorResponseDTO);
    res.status(200).json(dto);
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("auth-token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out" });
  };
}
