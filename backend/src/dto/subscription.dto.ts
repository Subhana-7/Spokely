import { Date, Types } from "mongoose";

export interface CreateSubscriptionDTO {
  userId: string;
  mentorId: string;
  plan: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
  price: number;
  time: number;
}

export interface SetMentorPlansDTO {
  mentorId: string;
  plans: {
    type: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
    price: number;
    time: number;
  }[];
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  mentorId: string;
  plan: string;
  status: string;
  time: number;
  startDate: Date;     
  createdAt: Date;  
  updatedAt: Date; 
}

