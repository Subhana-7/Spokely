// GoogleRedirectHandler.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const { role, isGoogleUser } = payload;

        if (isGoogleUser) {
          navigate("/role-selection");
        } else if (role === "mentor") {
          navigate("/pages/admin/home");
        } else {
          navigate("/pages/user/home");
        }
      } catch (err) {
        console.error("Invalid token", err);
        navigate("/");
      }
    } else {
      alert("Token not found");
      navigate("/");
    }
  }, []);

  return <div className="p-4 text-center">Logging in via Google...</div>;
};

export default GoogleRedirectHandler;
