import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}/api`,
  withCredentials: true,
});

export const adminLogin = async (email: string, password: string) => {
  const response = await API.post("/admin/login", { email, password });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

export const getAllMentors = async () => {
  const response = await API.get("/admin/mentors");
  return response.data;
};

export const blockUser = async (id: string) => {
  return API.patch(`/admin/users/${id}/block`);
};

// export const deleteUser = async (id: string) => {
//   return API.delete(`/admin/users/${id}`);
// };

export const blockMentor = async (id: string) => {
  return API.patch(`/admin/mentors/${id}/block`);
};

// export const deleteMentor = async (id: string) => {
//   return API.delete(`/admin/mentors/${id}`);
// };

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
