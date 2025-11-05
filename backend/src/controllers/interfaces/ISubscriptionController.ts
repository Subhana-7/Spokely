import { Request, Response } from "express";

export interface ISubscriptionController {
  subscribe(req: Request, res: Response): Promise<void>;
  getUserSubscriptions(req: Request, res: Response): Promise<void>;
  getMentorSubscriptions(req: Request, res: Response): Promise<void>;
  cancelSubscription(req: Request, res: Response): Promise<void>;
  getMentorPlans(req: Request, res: Response): Promise<void>;
  setMentorPlans(req: Request, res: Response): Promise<void>;
  getSubscriptionHistory(req: Request, res: Response): Promise<void>;
}
