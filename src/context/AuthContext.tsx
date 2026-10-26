import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api.ts';
import { IUser } from '../server/models/types.ts';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      if (res.user) {
        setUser(res.user as IUser);
      } else if (res.data) {
        const d = res.data as any;
        setUser(d.user || d);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('gowheels_jwt_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ user: IUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.token) {
      localStorage.setItem('gowheels_jwt_token', res.token);
    }
    if (res.user) {
      setUser(res.user as IUser);
    }
    setAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const res = await apiRequest<{ user: IUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (res.token) {
      localStorage.setItem('gowheels_jwt_token', res.token);
    }
    if (res.user) {
      setUser(res.user as IUser);
    }
    setAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('gowheels_jwt_token');
      setUser(null);
    }
  };

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
