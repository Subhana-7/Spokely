export interface CreateSubscriptionDTO {
  userId: string;
  mentorId: string;
  plan: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY";
  price: number;
  time: number;   // 👈 added as number
}

export interface SetMentorPlansDTO {
  mentorId: string;
  plans: { type: "DAILY" | "WEEKLY" | "BIWEEKLY" | "TRIWEEKLY"; price: number; time: number }[];
}