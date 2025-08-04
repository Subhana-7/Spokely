import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store/userAuthStore";

type CustomJwtPayload = {
  role: "user" | "mentor";
  isGoogleUser?: boolean;
};

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const source = params.get("source");

    console.log("✅ Full redirect URL:", window.location.href);
    console.log("✅ token:", token, "source:", source);

    if (token) {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      if (decoded?.role) {
        setRole(decoded.role);
      }

      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;

      // Delay slightly to make sure state is set
      setTimeout(() => {
        if (source === "signup") {
          navigate(decoded.role === "mentor" ? "/mentor/home" : "/user/home");
        } else {
          navigate("/");
        }
      }, 100);
    } else {
      console.log("❌ Token not found in URL");
    }
  }, [navigate, setRole]);

  return null;
};

export default GoogleRedirectHandler;
