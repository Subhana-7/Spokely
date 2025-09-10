export interface CreateSubscriptionDTO {
  userId: string;
  mentorId: string;
  plan: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
  price: number;
}

export interface SetMentorPlansDTO {
  mentorId: string;
  plans: { plan: string; price: number }[];
}
