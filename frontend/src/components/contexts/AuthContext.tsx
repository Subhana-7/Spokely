// src/components/contexts/AuthContext.tsx
import { createContext, useContext } from 'react';
import { useAuthStore } from '../../store/userAuthStore';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, role, isAuthenticated } = useAuthStore();

  // You can decode the token here if needed
  const user = token
    ? JSON.parse(atob(token.split('.')[1]))
    : null;

  return (
    <AuthContext.Provider value={{ token, role, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
