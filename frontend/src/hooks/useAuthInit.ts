import { useEffect, useState } from "react";
import { refreshToken } from "../services/auth";
import { useAuthStore } from "../store/userAuthStore";

export const useAuthInit = () => {
  const { setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await refreshToken();
        console.log("refreshToken response:", res);


        if (res?.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return loading;
};
