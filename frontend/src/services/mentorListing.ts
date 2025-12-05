import API from "../api/axios.instance";

export const getPublicMentors = async (page = 1, search = "") => {
  return await API.get(
    `/users/mentor/listing?page=${page}&limit=6&search=${search}`
  );
};
