import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, User, Key, Hash, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onTenantLogin: (contract: any) => void;
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onTenantLogin, addNotification }) => {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'admin' | 'tenant'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  
  const [tenantCredentials, setTenantCredentials] = useState({
    contractNumber: '',
    accessCode: ''
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredentials.username || !adminCredentials.password) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const success = await login(adminCredentials, 'admin');
      if (success) {
        toast.success('ورود موفقیت‌آمیز');
        addNotification('ورود موفقیت‌آمیز به سیستم', 'success');
      } else {
        toast.error('نام کاربری یا رمز عبور اشتباه است');
        addNotification('نام کاربری یا رمز عبور اشتباه است', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('خطا در ورود به سیستم');
      addNotification('خطا در ورود به سیستم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantCredentials.contractNumber || !tenantCredentials.accessCode) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const success = await login(tenantCredentials, 'tenant');
      if (success) {
        toast.success('ورود موفقیت‌آمیز');
        addNotification('ورود موفقیت‌آمیز به سیستم', 'success');
      } else {
        toast.error('شماره قرارداد یا کد دسترسی اشتباه است');
        addNotification('شماره قرارداد یا کد دسترسی اشتباه است', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('خطا در ورود به سیستم');
      addNotification('خطا در ورود به سیستم', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سیستم مدیریت املاک</h1>
          <p className="text-white/80">ورود به سیستم مدیریت قراردادهای اجاره</p>
        </div>

        {/* Login Type Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-6">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setLoginType('admin')}
              className={`py-3 px-4 rounded-md font-medium transition-all ${
                loginType === 'admin'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4 inline ml-2" />
              مدیر سیستم
            </button>
            <button
              onClick={() => setLoginType('tenant')}
              className={`py-3 px-4 rounded-md font-medium transition-all ${
                loginType === 'tenant'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Key className="w-4 h-4 inline ml-2" />
              مستأجر
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loginType === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام کاربری
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="form-input pr-10"
                    placeholder="نام کاربری خود را وارد کنید"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="form-input pr-10 pl-10"
                    placeholder="رمز عبور خود را وارد کنید"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    در حال ورود...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 ml-2" />
                    ورود به سیستم
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTenantLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره قرارداد
                </label>
                <div className="relative">
                  <Hash className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={tenantCredentials.contractNumber}
                    onChange={(e) => setTenantCredentials(prev => ({ ...prev, contractNumber: e.target.value }))}
                    className="form-input pr-10"
                    placeholder="مثال: RNT123456789"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد دسترسی
                </label>
                <div className="relative">
                  <Key className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={tenantCredentials.accessCode}
                    onChange={(e) => setTenantCredentials(prev => ({ ...prev, accessCode: e.target.value }))}
                    className="form-input pr-10"
                    placeholder="کد 6 رقمی ارسال شده"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    در حال ورود...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 ml-2" />
                    ورود به سیستم
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">اطلاعات ورود نمونه:</h4>
            <div className="text-sm text-blue-800">
              <p><strong>مدیر:</strong> admin / Admin@123!</p>
              <p className="text-xs text-blue-600 mt-1">
                برای تست سیستم از اطلاعات بالا استفاده کنید
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>© 2024 سیستم مدیریت املاک. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;