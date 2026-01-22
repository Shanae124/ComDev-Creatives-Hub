import { useState, useContext, createContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const register = async (email, password, firstName, lastName, role = 'student') => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      firstName,
      lastName,
      role,
    });
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, apiClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
