import API from "../api/axios.instance";
import { SUBSCRIPTION_ROUTES as R } from "../constants/routes";

export interface MentorPlan {
  type: string;
  price: number;
  time: number; 
}

export interface SubscriptionData {
  mentorId: string;
  planId: string;
  userId: string;
  amount: number;
}

// --- Mentor Plans ---
export const getMentorPlans = (mentorId: string) =>
  API.get<MentorPlan[]>(`${R.base}${R.mentorPlans}/${mentorId}/plans`);

export const saveMentorPlans = (mentorId: string, plans: MentorPlan[]) =>
  API.post(`${R.base}${R.savePlans}`, { mentorId, plans });

// --- Subscriptions ---
export const subscribeMentor = (data: SubscriptionData) =>
  API.post(`${R.base}${R.subscribe}`, data);

export const getUserSubscriptions = (userId: string) =>
  API.get(`${R.base}${R.mySubscriptions}/${userId}`);

export const getMentorStudents = (mentorId: string) =>
  API.get(`${R.base}${R.mentorStudents}/${mentorId}`);
