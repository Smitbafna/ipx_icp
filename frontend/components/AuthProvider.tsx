'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Identity } from '@dfinity/agent';
import { login, logout, isAuthenticated, getIdentity, getPrincipal } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        const userIdentity = await getIdentity();
        const userPrincipal = await getPrincipal();
        setIdentity(userIdentity);
        setPrincipal(userPrincipal);
      } else {
        setIdentity(null);
        setPrincipal(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await login();
      if (success) {
        await checkAuth();
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logout();
      setAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    identity,
    principal,
    login: handleLogin,
    logout: handleLogout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
