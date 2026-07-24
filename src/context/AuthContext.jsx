import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedUser = localStorage.getItem('wholesale_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          
          // Verify with backend if token is still valid
          const res = await axios.get('/api/auth/me');
          setUser({ ...res.data, token: parsedUser.token });
        } catch (error) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('wholesale_user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('wholesale_user', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu',
        isNotVerified: error.response?.data?.isNotVerified || false,
        email: error.response?.data?.email || '',
      };
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Kayıt olunurken bir hata oluştu',
      };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const res = await axios.post('/api/auth/resend-verification', { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'E-posta gönderilirken bir hata oluştu',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'E-posta gönderilirken bir hata oluştu',
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('wholesale_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profil güncellenirken bir hata oluştu',
      };
    }
  };

  const syncUserFavorites = (favoritesArray) => {
    if (!user) return;
    const updatedUser = { ...user, favorites: favoritesArray };
    setUser(updatedUser);
    localStorage.setItem('wholesale_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wholesale_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, syncUserFavorites, resendVerificationEmail, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
