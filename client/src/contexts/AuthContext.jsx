import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('e4b_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('e4b_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('e4b_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('e4b_token');
          localStorage.removeItem('e4b_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const clearStaleLessonStorage = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('e4b_lesson_') || k.includes('_lesson_') || k.startsWith('e4b_placement_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem('e4b_placement_answers');
      sessionStorage.removeItem('e4b_placement_index');
    } catch {}
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    try {
      const prevUser = localStorage.getItem('e4b_user');
      if (prevUser) {
        const parsed = JSON.parse(prevUser);
        if (parsed?.id !== userData.id) {
          clearStaleLessonStorage();
        }
      }
    } catch {}
    localStorage.setItem('e4b_token', token);
    localStorage.setItem('e4b_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, goal) => {
    clearStaleLessonStorage();
    const res = await api.post('/auth/register', { name, email, password, goal });
    const { token, user: userData } = res.data;
    localStorage.setItem('e4b_token', token);
    localStorage.setItem('e4b_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('e4b_token');
    localStorage.removeItem('e4b_user');
    clearStaleLessonStorage();
    setUser(null);
  };

  const updateUser = (newFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...newFields };
      localStorage.setItem('e4b_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
