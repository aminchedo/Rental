import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '../config/api';

interface User {
  id: string;
  role: 'admin' | 'tenant' | 'landlord';
  name: string;
  username?: string;
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

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: { contractNumber: string; accessCode: string }, userType: 'admin' | 'tenant'): Promise<boolean> => {
    const { contractNumber, accessCode } = credentials;

    try {
      let loginData;
      
      if (userType === 'admin') {
        loginData = {
          username: contractNumber,
          password: accessCode
        };
      } else {
        loginData = {
          contractNumber,
          accessCode
        };
      }

      const response = await api.post(endpoints.login, loginData);

      if (response.data.success && response.data.token) {
        // Store JWT token
        localStorage.setItem('authToken', response.data.token);
        
        let user: User;
        
        if (userType === 'admin') {
          user = {
            id: response.data.user.id,
            role: 'admin',
            name: 'مدیر سیستم',
            username: response.data.user.username
          };
        } else {
          user = {
            id: response.data.contract.id,
            role: 'tenant',
            name: 'مستأجر',
            contractNumber: response.data.contract.contractNumber,
            contract: response.data.contract
          };
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Update state
    setIsAuthenticated(false);
    setCurrentUser(null);
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