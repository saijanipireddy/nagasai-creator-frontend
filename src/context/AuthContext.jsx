import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { studentAuthAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('studentInfo');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await studentAuthAPI.login({ email, password });
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await studentAuthAPI.register({ name, email, password });
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
