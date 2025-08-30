import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiHelpers } from '../config/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  role: 'admin' | 'tenant' | 'landlord';
  name: string;
  username?: string;
  contractNumber?: string;
  contract?: any;
}

interface LoginCredentials {
  username?: string;
  password?: string;
  contractNumber?: string;
  accessCode?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (credentials: LoginCredentials, userType: 'admin' | 'tenant') => Promise<boolean>;
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
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials, userType: 'admin' | 'tenant'): Promise<boolean> => {
    try {
      let response;
      
      if (userType === 'admin') {
        // Admin login with real credentials (admin/admin)
        const { username = 'admin', password = 'admin' } = credentials;
        response = await apiHelpers.adminLogin(username, password);
      } else {
        // Tenant login with contract number and access code
        const { contractNumber, accessCode } = credentials;
        if (!contractNumber || !accessCode) {
          toast.error('شماره قرارداد و کد دسترسی الزامی است');
          return false;
        }
        response = await apiHelpers.tenantLogin(contractNumber, accessCode);
      }

      if (response.success && response.token) {
        // Store JWT token with correct key
        localStorage.setItem('auth_token', response.token);
        
        let user: User;
        
        if (userType === 'admin') {
          user = {
            id: response.user?.id || 'admin_1',
            role: 'admin',
            name: 'مدیر سیستم',
            username: response.user?.username || 'admin'
          };
          toast.success('ورود موفقیت‌آمیز مدیر سیستم');
        } else {
          // Handle tenant login response
          const contract = response.contract || response.user?.contract;
          user = {
            id: contract?.id || `tenant_${Date.now()}`,
            role: 'tenant',
            name: contract?.tenant_name || 'مستأجر',
            contractNumber: contract?.contract_number,
            contract: contract
          };
          toast.success('ورود موفقیت‌آمیز مستأجر');
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      }
      
      toast.error('اطلاعات ورود نادرست است');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.response?.status === 401) {
        toast.error('نام کاربری یا رمز عبور اشتباه است');
      } else if (error.response?.status === 404) {
        toast.error('قرارداد یافت نشد');
      } else {
        toast.error('خطا در ورود. لطفا دوباره تلاش کنید');
      }
      
      return false;
    }
  };

  const logout = () => {
    // Clear stored data with correct key
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Update state
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    toast.success('خروج موفقیت‌آمیز');
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