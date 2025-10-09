import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  role: 'admin' | 'tenant';
  name: string;
  username?: string;
  contractNumber?: string;
  contract?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  login: (credentials: any, userType: 'admin' | 'tenant') => Promise<boolean>;
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
  const [loading, setLoading] = useState(true);

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
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: any, userType: 'admin' | 'tenant'): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('authToken', data.token);
          
          let user: User;
          if (userType === 'admin' && data.user) {
            user = {
              id: data.user.id,
              role: 'admin',
              name: data.user.name || data.user.username,
              username: data.user.username
            };
          } else if (userType === 'tenant' && data.contract) {
            user = {
              id: data.contract.id,
              role: 'tenant',
              name: data.contract.tenantName,
              contractNumber: data.contract.contractNumber,
              contract: data.contract
            };
          } else {
            throw new Error('Invalid login response');
          }
          
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const setAuthenticated = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const value = {
    isAuthenticated,
    currentUser,
    loading,
    login,
    logout,
    setCurrentUser,
    setAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};