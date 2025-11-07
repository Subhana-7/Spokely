import API from "../api/axios.instance";
import { USER_ROUTES as R } from "../constants/routes";

export const getPublicMentors = async (page = 1, search = "") => {
  return await API.get(
    `/users/mentor/listing?page=${page}&limit=6&search=${search}`
  );
};
