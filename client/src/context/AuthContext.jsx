import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('jewel_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('jewel_user', JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.warn('Auth check warning:', err.message);
          // Keep saved user if token validation fails locally
          const saved = getSavedUser();
          if (saved) setUser(saved);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, portal = 'customer') => {
    const res = await axios.post('/api/auth/login', { email, password, portal });
    const { token: t, ...userData } = res.data;
    setToken(t);
    setUser(userData);
    localStorage.setItem('token', t);
    localStorage.setItem('jewel_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    const { token: t, ...userData } = res.data;
    setToken(t);
    setUser(userData);
    localStorage.setItem('token', t);
    localStorage.setItem('jewel_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('jewel_token');
    localStorage.removeItem('jewel_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
