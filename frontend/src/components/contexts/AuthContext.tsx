import { createContext, useContext } from 'react';
import { useAuthStore } from '../../store/userAuthStore';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, role, isAuthenticated } = useAuthStore();

  const safeDecode = (token: string | null) => {
  try {
    return token ? JSON.parse(atob(token.split('.')[1])) : null;
  } catch {
    return null;
  }
};

const user = safeDecode(token);

  return (
    <AuthContext.Provider value={{ token, role, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
