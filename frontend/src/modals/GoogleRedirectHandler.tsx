import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type CustomJwtPayload = {
  role: "user" | "mentor";
  isGoogleUser?: boolean;
};

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const source = params.get("source");

    if (token) {
      try {
        localStorage.setItem("spokely_token", token);

        const payload = jwtDecode<CustomJwtPayload>(token);
        const { role, isGoogleUser } = payload;

        setTimeout(() => {
          // if (source === "signup" && isGoogleUser) {
          //   navigate("/role-selection");
          // } else
           if (role === "mentor") {
            navigate("/mentor/home");
          } else {
            navigate("/user/home");
          }
        }, 100); 
      } catch (e) {
        console.error("Invalid token or decoding failed", e);
        alert("Invalid login session.");
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
