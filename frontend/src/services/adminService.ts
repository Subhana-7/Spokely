import API from "../api/axios.instance";

export const adminLogin = async (email: string, password: string) => {
  const response = await API.post("/admin/login", { email, password });
  return response;
};

export const getAllUsers = async (params = {}) => {
  const response = await API.get("/admin/users", { params });
  return response;
};

export const getAllMentors = async (params: Record<string, any> = {}) => {
  const response = await API.get("/admin/mentors", { params });
  return response;
};

export const updateUserStatus = async (
  userId: string,
  status: "unBlocked" | "blocked"
) => {
  return API.patch(`/admin/users/${userId}/status`, { status });
};

export const blockUser = (userId: string) => updateUserStatus(userId, "blocked");
export const unblockUser = (userId: string) => updateUserStatus(userId, "unBlocked");

export const updateMentorStatus = async (
  mentorId: string,
  status: "unBlocked" | "blocked"
) => {
  return API.patch(`/admin/mentors/${mentorId}/status`, { status });
};

export const blockMentor = (mentorId: string) => updateMentorStatus(mentorId, "blocked");
export const unblockMentor = (mentorId: string) => updateMentorStatus(mentorId, "unBlocked");

export const mentorVerification = (id: string) => API.get(`/admin/mentors/verification/${id}`);
export const approveMentor = (id: string) => API.patch(`/admin/mentors/approve/${id}`);
export const rejectMentor = (id: string, rejectionReason: string) =>
  API.post(`/admin/mentors/reject/${id}`, { rejectionReason });

export const logout = () => API.post("/admin/logout");

export const adminSessionListing = (params: { page: number; limit: number; search: string; status: string }) =>
  API.get("/admin/sessions", { params });
