import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

interface User {
  role: 'landlord' | 'tenant';
  name: string;
  contractNumber?: string;
  contract?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (credentials: { contractNumber: string; accessCode: string }, userType: 'admin' | 'tenant') => Promise<boolean>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (credentials: { contractNumber: string; accessCode: string }, userType: 'admin' | 'tenant'): Promise<boolean> => {
    const { contractNumber, accessCode } = credentials;

    if (userType === 'admin') {
      try {
        const response = await axios.post(`${API_URL}/login`, {
          username: contractNumber,
          password: accessCode
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          const adminUser = { 
            role: 'landlord' as const, 
            name: 'مدیر سیستم' 
          };
          setCurrentUser(adminUser);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Admin login error:', error);
        return false;
      }
    }
    
    return false;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const setAuthenticated = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    setCurrentUser,
    setAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};