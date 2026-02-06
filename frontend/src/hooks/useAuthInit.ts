import { useEffect, useState } from "react";
import { refreshToken } from "../services/authServices";
import { useAuthStore } from "../store/userAuthStore";

export const useAuthInit = () => {
  const { setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await refreshToken();
        console.log("refreshToken response:", res);

        let userData = null;

        if (res?.user) {
          userData = res.user;
        } else if (res?.mentor) {
          userData = res.mentor;
        } else if (res?.admin) {
          userData = res.admin;
        }

        if (userData?.isBlocked) {
          logout();
          window.location.href = "/blocked";
          return;
        }

        if (userData) {
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            uniqueCode: userData.uniqueCode,
            profilePicture: userData.profilePicture,
            phone: userData.phone,
            bio: userData.bio,
            level: userData.level,
            tags: userData.tags || [],
            isBlocked: userData.isBlocked || false,
          });
          console.log("Normalized userData:", userData);
        } else {
          logout();
        }
      } catch (err) {
        logout()
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return loading;
};
