import { createContext, useContext } from 'react';
import { useAuthStore } from '../../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { logoutService } from '../../services/authServices';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, role, isAuthenticated, logout: localLogout } = useAuthStore();
  const navigate = useNavigate();

  const safeDecode = (token: string | null) => {
    try {
      return token ? JSON.parse(atob(token.split('.')[1])) : null;
    } catch {
      return null;
    }
  };

  const user = safeDecode(token);

  const logout = async () => {
    try {
      await logoutService()
      localLogout(); 
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, role, user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);