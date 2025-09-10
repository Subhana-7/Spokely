import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}/api`,
  withCredentials: true,
});

export const adminLogin = async (email: string, password: string) => {
  const response = await API.post("/admin/login", { email, password });
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams(params as any).toString();
  const response = await API.get(`/admin/users?${query}`);
  return response.data;
};

export const getAllMentors = async (params: Record<string, any> = {}) => {
  const response = await API.get("/admin/mentors", { params });
  return {
    mentors: response.data.mentors,
    total: response.data.total,
  };
};

export const updateUserStatus = async (
  userId: string,
  status: "unBlocked" | "blocked"
) => {
  const response = await API.patch(`/admin/users/${userId}/status`, {
    status,
  });
  return response.data;
};

export const blockUser = async (userId: string) => {
  return updateUserStatus(userId, "blocked");
};

export const unblockUser = async (userId: string) => {
  return updateUserStatus(userId, "unBlocked");
};

export const updateMentorStatus = async (
  mentorId: string,
  status: "unBlocked" | "blocked"
) => {
  const response = await API.patch(`/admin/mentors/${mentorId}/status`, {
    status,
  });
  return response.data;
};

export const blockMentor = async (mentorId: string) => {
  return updateMentorStatus(mentorId, "blocked");
};

export const unblockMentor = async (mentorId: string) => {
  return updateMentorStatus(mentorId, "unBlocked");
};

export const mentorVerification = async (id: string) => {
  return API.get(`/admin/mentors/verification/${id}`);
};

export const approveMentor = async (id: string) => {
  return API.patch(`/admin/mentors/approve/${id}`);
};

export const rejectMentor = async (
  id: string,
  { rejectionReason }: { rejectionReason: string }
) => API.post(`/admin/mentors/reject/${id}`, { rejectionReason });

export const logout = async() => API.post(`/admin/logout`)