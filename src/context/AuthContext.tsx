'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginCustomerOtp: (phoneNumber: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  sendCustomerOtp: (phoneNumber: string, name?: string) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  loginCustomerVip: () => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (pin: string, secretKey?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminQuick: () => Promise<{ success: boolean; error?: string }>;
  loginKitchen: (pin: string) => Promise<{ success: boolean; error?: string }>;
  loginKitchenQuick: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'hemanth_auth_user';
const TOKEN_STORAGE_KEY = 'hemanth_auth_token';
const ROLE_STORAGE_KEY = 'hemanth_auth_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.warn('Auth hydration failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuth = (newUser: UserProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(ROLE_STORAGE_KEY, newUser.role);
    document.cookie = `hemanth_auth_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `hemanth_role=${newUser.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    document.cookie = 'hemanth_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'hemanth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  // 1. Customer Auth
  const sendCustomerOtp = async (phoneNumber: string, name?: string) => {
    try {
      const res = await fetch('/api/customer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const loginCustomerOtp = async (phoneNumber: string, otp: string, name?: string) => {
    try {
      const res = await fetch('/api/customer/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp, name }),
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid passcode' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification error' };
    }
  };

  const loginCustomerVip = async () => {
    try {
      const res = await fetch('/api/customer/auth/vip-login', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'VIP Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  // 2. Admin Auth
  const loginAdmin = async (pin: string, secretKey?: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, secretKey }),
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid Admin credentials' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin authentication error' };
    }
  };

  const loginAdminQuick = async () => {
    try {
      const res = await fetch('/api/admin/auth/quick-login', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Quick admin login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  // 3. Kitchen Auth
  const loginKitchen = async (pin: string) => {
    try {
      const res = await fetch('/api/kitchen/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid Kitchen Staff PIN' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Kitchen authentication error' };
    }
  };

  const loginKitchenQuick = async () => {
    try {
      const res = await fetch('/api/kitchen/auth/quick-login', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        saveAuth(data.user, data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Quick kitchen login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    clearAuth();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        loginCustomerOtp,
        sendCustomerOtp,
        loginCustomerVip,
        loginAdmin,
        loginAdminQuick,
        loginKitchen,
        loginKitchenQuick,
        logout,
      }}
    >
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
