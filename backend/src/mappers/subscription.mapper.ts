import {
  CreateSubscriptionDTO,
  SetMentorPlansDTO,
  SubscriptionDTO,
} from "../dto/subscription.dto";
import { ISubscription } from "../models/subscription.modal";

export function mapToCreateSubscriptionDTO(body: any): CreateSubscriptionDTO {
  if (
    !body.userId ||
    !body.mentorId ||
    !body.plan ||
    !body.price ||
    !body.time
  ) {
    throw new Error("Missing subscription data");
  }

  return {
    userId: body.userId.toString(),
    mentorId: body.mentorId.toString(),
    plan: body.plan,
    price: Number(body.price),
    time: Number(body.time),
  };
}

export function mapToSetMentorPlansDTO(body: any): SetMentorPlansDTO {
  if (!body.mentorId || !body.plans) {
    throw new Error("Missing mentor plan data");
  }

  return {
    mentorId: body.mentorId.toString(),
    plans: body.plans.map((p: any) => ({
      type: p.type,
      price: Number(p.price),
      time: Number(p.time),
    })),
  };
}

export function mapSubscriptionDTO(data:ISubscription) {
  return {
    _id:data._id,
  userId:data.userId,
  mentorId:data.mentorId,
  plan:data.plan,
  status:data.status,
  time:data.time,
  startDate:data.startDate,
  createAt:data.createdAt,
  updateAt:data.updatedAt,
  }
}