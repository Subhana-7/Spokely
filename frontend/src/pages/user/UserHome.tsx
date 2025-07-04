import { useEffect } from "react";
import axios from 'axios'
const UserHome = () => {

  useEffect(() => {
  axios.get("http://localhost:5000/api/users/test-auth", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("spokely_token")}`,
    },
  })
  .then(res => {
    console.log("Authenticated:", res.data);
  })
  .catch(err => {
    console.error("Not authenticated", err);
    // optionally navigate to "/"
  });
}, []);

  return (
    <div>
      <h1>Hello user</h1>
    </div>
  );
};

export default UserHome;
