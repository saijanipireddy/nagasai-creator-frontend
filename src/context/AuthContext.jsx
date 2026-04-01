import { createContext, useContext, useState, useEffect } from 'react';
import { studentAuthAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify session by calling the profile endpoint.
  // If access token expired, the axios interceptor auto-refreshes it.
  // If refresh also fails, user is not authenticated.
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const { data } = await studentAuthAPI.getProfile();
        if (!cancelled) setStudent(data);
      } catch {
        if (!cancelled) setStudent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const { data } = await studentAuthAPI.login({ email, password });
    setStudent({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = async () => {
    try {
      await studentAuthAPI.logout();
    } catch {
      // Ignore errors — clear local state regardless
    }
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, logout, isAuthenticated: !!student }}>
      {children}
    </AuthContext.Provider>
  );
};
