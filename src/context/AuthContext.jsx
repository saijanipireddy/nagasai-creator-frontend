import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const info = localStorage.getItem('studentInfo');

    if (token && info) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setStudent(JSON.parse(info));
        } else {
          localStorage.removeItem('studentToken');
          localStorage.removeItem('studentInfo');
        }
      } catch {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/student-auth/login', { email, password });
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('studentInfo', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
    setStudent({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, logout, isAuthenticated: !!student }}>
      {children}
    </AuthContext.Provider>
  );
};
