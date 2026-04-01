import { createContext, useContext, useState, useEffect } from 'react';
import { studentAuthAPI, setTokens, clearTokens, getAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if we have an access token in memory, verify it.
  // If not, try the refresh endpoint (which uses cookies if available).
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        if (getAccessToken()) {
          const { data } = await studentAuthAPI.getProfile();
          if (!cancelled) setStudent(data);
          return;
        }

        // No token in memory — try refresh (uses cookie if browser stored it)
        try {
          const { data } = await studentAuthAPI.refresh();
          if (data.accessToken) {
            setTokens(data.accessToken, data.refreshToken);
          }
          if (!cancelled) setStudent({ _id: data._id, name: data.name, email: data.email });
        } catch {
          if (!cancelled) setStudent(null);
        }
      } catch {
        clearTokens();
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
    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
    }
    setStudent({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = async () => {
    try {
      await studentAuthAPI.logout();
    } catch {
      // Ignore
    }
    clearTokens();
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, logout, isAuthenticated: !!student }}>
      {children}
    </AuthContext.Provider>
  );
};
