"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// For demo purposes, using simple auth. In production, use proper authentication
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // Change this!
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    try {
      if (typeof window !== 'undefined') {
        const adminAuth = localStorage.getItem('lifewear_admin_auth');
        if (adminAuth === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifewear_admin_auth', 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lifewear_admin_auth');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
