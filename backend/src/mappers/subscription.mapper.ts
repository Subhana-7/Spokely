import {
  CreateSubscriptionDTO,
  SetMentorPlansDTO,
} from "../dto/subscription.dto";

export function mapToCreateSubscriptionDTO(body: any): CreateSubscriptionDTO {
  if (!body.userId || !body.mentorId || !body.plan || !body.price) {
    throw new Error("Missing subscription data");
  }

  return {
    userId: body.userId.toString(),
    mentorId: body.mentorId.toString(),
    plan: body.plan,
    price: Number(body.price),
  };
}

export function mapToSetMentorPlansDTO(body: any): SetMentorPlansDTO {
  if (!body.mentorId || !body.plans) {
    throw new Error("Missing mentor plan data");
  }

  return {
    mentorId: body.mentorId.toString(),
    plans: body.plans.map((p: any) => ({
      plan: p.plan,
      price: Number(p.price),
    })),
  };
}
