import API from "../api/axios.instance";
import { USER_ROUTES as R } from "../constants/routes";

export const getPublicMentors = async () => {
  return await API.get(`${R.base}${R.mentorLising}`);
};