import API from "../api/axios.instance";

export const getMentorPlans = (mentorId: string) =>
  API.get(`/subscription/mentor/${mentorId}/plans`);

export const saveMentorPlans = (mentorId: string, plans: any[]) =>
  API.post("/subscription/mentor/plans", { mentorId, plans });

export const subscribeMentor = (data: any) => API.post("/subscription/subscribe", data);

export const getUserSubscriptions = (userId: string) =>
  API.get(`/subscription/my-subscriptions/${userId}`);

export const getMentorStudents = (mentorId: string) =>
  API.get(`/subscription/mentor-students/${mentorId}`);
