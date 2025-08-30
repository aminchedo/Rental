import React, { createContext, useContext, useState, ReactNode } from 'react';

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
      // Hardcoded admin credentials (will be replaced with secure authentication)
      if (contractNumber === 'admin' && accessCode === 'admin') {
        const adminUser = { 
          role: 'landlord' as const, 
          name: 'مدیر سیستم' 
        };
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } else {
      // Tenant login - will be handled by ContractContext
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};