import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  specialization?: string;
  licenseNumber?: string;
  age?: number;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('hc_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('hc_token');
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => {
          setState({ user: data.user, token, isAuthenticated: true, isLoading: false });
        })
        .catch(() => {
          localStorage.removeItem('hc_token');
          localStorage.removeItem('hc_user');
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hc_token', data.token);
    setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  };

  const register = async (formData: RegisterData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('hc_token', data.token);
    setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = (user: User) => {
    setState((s) => ({ ...s, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
