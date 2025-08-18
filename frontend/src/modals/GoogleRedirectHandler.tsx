import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import { refreshToken } from "../services/authServices";

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const source = params.get("source");

    (async () => {
      try {
        const res = await refreshToken();
        setUser(res.data.user);

        if (source === "signup") {
          navigate(
            res.data.user.role === "mentor" ? "/mentor/home" : "/user/home"
          );
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error(" Google redirect failed:", err);
        navigate("/");
      }
    })();
  }, [navigate, location.search, setUser]);

  return null;
};

export default GoogleRedirectHandler;
