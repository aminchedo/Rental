import React, { useState } from 'react';
import { Home, Key, Lock, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';

interface LoginPageProps {
  onTenantLogin: (contract: any) => void;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onTenantLogin, addNotification }) => {
  const [loginForm, setLoginForm] = useState({ contractNumber: '', accessCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, setCurrentUser, setAuthenticated } = useAuth();
  const { fetchContracts, getContractByCredentials } = useContracts();

  const handleAdminLogin = async () => {
    const { contractNumber: username, accessCode: password } = loginForm;
    const success = await login({ contractNumber: username, accessCode: password }, 'admin');
    
    if (success) {
      await fetchContracts();
      addNotification('مدیر سیستم با موفقیت وارد شد', 'success');
    } else {
      alert('نام کاربری یا رمز عبور مدیر اشتباه است');
    }
  };

  const handleTenantLogin = async () => {
    const { contractNumber, accessCode } = loginForm;
    setIsLoading(true);
    
    try {
      await fetchContracts();
      const contract = getContractByCredentials(contractNumber, accessCode);
      
      if (contract) {
        if (contract.status === 'signed') {
          alert('این قرارداد قبلاً امضا شده و دیگر قابل دسترسی نیست');
          return;
        }
        
        const tenantUser = {
          role: 'tenant' as const,
          name: contract.tenantName,
          contractNumber: contract.contractNumber,
          contract: contract
        };
        setCurrentUser(tenantUser);
        setAuthenticated(true);
        onTenantLogin(contract);
        addNotification(`مستأجر ${contract.tenantName} وارد شد`, 'success');
      } else {
        alert('شماره قرارداد یا کد دسترسی اشتباه است یا قرارداد منقضی شده');
      }
    } catch (error) {
      console.error('Error during tenant login:', error);
      alert('خطا در ورود به سیستم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">سیستم اجاره‌نامه</h1>
          <p className="text-gray-600">ورود به سیستم حرفه‌ای مدیریت قراردادها</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              شماره قرارداد / نام کاربری
            </label>
            <div className="relative">
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={loginForm.contractNumber}
                onChange={(e) => setLoginForm(prev => ({ ...prev, contractNumber: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="RNT... یا admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              کد دسترسی / رمز عبور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={loginForm.accessCode}
                onChange={(e) => setLoginForm(prev => ({ ...prev, accessCode: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="کد 6 رقمی یا admin"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTenantLogin}
              disabled={!loginForm.contractNumber || !loginForm.accessCode || isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <UserCheck className="w-4 h-4" />
              مستأجر
            </button>
            <button
              onClick={handleAdminLogin}
              disabled={!loginForm.contractNumber || !loginForm.accessCode || isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Shield className="w-4 h-4" />
              مدیر
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="mr-2 text-gray-600">در حال بررسی...</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">💡 راهنمای ورود:</p>
            <div className="space-y-1 text-xs">
              <p><strong>مستأجر:</strong> شماره قرارداد + کد دسترسی</p>
              <p><strong>مدیر:</strong> admin + admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;