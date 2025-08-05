import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '../store/userAuthStore';

interface AuthState {
  isAuthenticated: boolean;
  role: 'user' | 'mentor' | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { role, setRole } = useAuthStore();

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check if auth token exists
      const authToken = Cookies.get('auth-token');
      const userRole = Cookies.get('role') as 'user' | 'mentor' | undefined;
      
      if (!authToken || !userRole) {
        setIsAuthenticated(false);
        setRole(null);
        setLoading(false);
        return;
      }

      // Verify token by making a request to a protected endpoint
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_SIDE_URL}/api/${userRole}s/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
          setRole(userRole);
        } else {
          // Token is invalid, clear cookies
          Cookies.remove('auth-token');
          Cookies.remove('refresh-token');
          Cookies.remove('role');
          setIsAuthenticated(false);
          setRole(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
        setRole(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isAuthenticated,
    role,
    loading,
    checkAuth,
  };
};