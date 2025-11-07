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

export const getUserSubscriptions = (
  userId: string,
  search?: string,
  status?: string,
  page: number = 1,
  limit: number = 6
) => {
  const query = new URLSearchParams();

  if (search && search.trim()) query.append("search", search);
  if (status && status !== "All") query.append("status", status);
  query.append("page", page.toString());
  query.append("limit", limit.toString());

  return API.get(`${R.base}${R.mySubscriptions}/${userId}?${query.toString()}`);
};


export const getMentorStudents = (
  mentorId: string,
  search: string = "",
  page: number = 1,
  limit: number = 9
) => {
  const query = new URLSearchParams();
  if (search) query.append("search", search);
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  return API.get(`${R.base}${R.mentorStudents}/${mentorId}?${query.toString()}`);
};



export const getSubscriptionHistory = (userId: string, page = 1, limit = 6) =>
  API.get(`/subscription/history/${userId}?page=${page}&limit=${limit}`);
