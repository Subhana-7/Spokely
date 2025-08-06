// src/components/DashBoardComponents.jsx/GreetingsBanner.tsx (or .tsx if you rename it)
import React, { useEffect } from 'react';
import { useAuthStore } from '../../../store/userAuthStore'; // adjust path as needed
import { refreshToken } from '../../../services/authServices';

const GreetingBanner = () => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await refreshToken(); // or your own call
      useAuthStore.getState().setUser(res.user);
    } catch (err) {
      console.error(err);
    }
  };

  fetchUser();
}, []);


  return (
    <div className="bg-lime-400 rounded-2xl p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">
        Hey {user?.name || "there"}! 👋
      </h1>
      <p className="text-lg opacity-90">
        Ready to level up your communication skills today?
      </p>
    </div>
  );
};

export default GreetingBanner;
