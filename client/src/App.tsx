import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, Upload, FileText, Download, User, Home, Calendar, DollarSign, 
  CheckCircle, AlertCircle, LogOut, Archive, Eye, Trash2, Edit, 
  Users, Key, Lock, Folder, Search, Filter, RefreshCw, Plus, Mail,
  Shield, QrCode, Clock, Zap, Settings, Send, Copy, Star,
  Building2, Receipt, UserCheck, Phone, MapPin, CreditCard, Bell
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const ProfessionalRentalSystem = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ contractNumber: '', accessCode: '' });
  const [formData, setFormData] = useState({
    contractNumber: '', tenantName: '', tenantEmail: '', tenantPhone: '',
    landlordName: '', landlordEmail: '', propertyAddress: '', propertyType: '',
    rentAmount: '', startDate: '', endDate: '', deposit: '',
    status: 'draft', accessCode: '', createdBy: 'landlord'
  });
  const [signatureImage, setSignatureImage] = useState<any>(null);
  const [signaturePreview, setSignaturePreview] = useState<any>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // NEW STATE for National ID
  const [nationalIdImage, setNationalIdImage] = useState<any>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState({ signature: false, nationalId: false });

  const adminUser = { username: 'admin', password: 'admin', role: 'landlord', name: 'مدیر سیستم' };

  const generateContractNumber = () => `RNT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();
  
  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/contracts`);
      const serverContracts = response.data || [];
      setContracts(serverContracts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts([]);
      setIsLoading(false);
    }
  };

  const saveContracts = async (updatedContracts: any[]) => {
    try {
      await axios.post(`${API_URL}/contracts`, updatedContracts);
      setContracts(updatedContracts);
    } catch (error) {
      console.error('Error saving contracts:', error);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  useEffect(() => { if (isAuthenticated) { loadContracts(); } }, [isAuthenticated]);
  useEffect(() => { filterContracts(); }, [contracts, searchQuery, statusFilter, currentUser]);
  useEffect(() => {
    const requiredFields = ['tenantName', 'tenantEmail', 'landlordName', 'landlordEmail', 'propertyAddress', 'rentAmount', 'startDate', 'endDate', 'deposit'];
    const isComplete = requiredFields.every(field => formData[field]?.toString().trim() !== '') && signatureImage;
    setIsFormComplete(isComplete);
  }, [formData, signatureImage]);

  const addNotification = (message: string, type = 'info') => {
    const notification = { id: Date.now(), message, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handleAdminLogin = async () => {
    const { contractNumber: username, accessCode: password } = loginForm;
    if (username === adminUser.username && password === adminUser.password) {
      await loadContracts();
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      addNotification('مدیر سیستم با موفقیت وارد شد', 'success');
    } else {
      alert('نام کاربری یا رمز عبور مدیر اشتباه است');
    }
  };

  const handleTenantLogin = async () => {
    const { contractNumber, accessCode } = loginForm;
    setIsLoading(true);
    const response = await axios.get(`${API_URL}/contracts`);
    const serverContracts = response.data || [];
    setContracts(serverContracts);
    setIsLoading(false);
    const contract = serverContracts.find((c: any) => c.contractNumber === contractNumber && c.accessCode === accessCode && c.status !== 'terminated');
    if (contract) {
      if (contract.status === 'signed') { alert('این قرارداد قبلاً امضا شده و دیگر قابل دسترسی نیست'); return; }
      setCurrentUser({ role: 'tenant', name: contract.tenantName, contractNumber: contractNumber, contract: contract });
      setIsAuthenticated(true);
      setCurrentView('form');
      loadContract(contract);
      addNotification(`مستأجر ${contract.tenantName} وارد شد`, 'success');
    } else {
      alert('شماره قرارداد یا کد دسترسی اشتباه است یا قرارداد منقضی شده');
    }
  };

  const handleLogout = () => {
    addNotification(`${currentUser.name} از سیستم خارج شد`, 'info');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginForm({ contractNumber: '', accessCode: '' });
    setCurrentView('dashboard');
    resetForm();
  };

  const filterContracts = () => {
    if (!currentUser) {
      setFilteredContracts([]);
      return;
    }

    let filtered = contracts;

    if (currentUser.role === 'tenant') {
      filtered = contracts.filter((contract: any) => 
        contract.contractNumber === currentUser.contractNumber
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((contract: any) => 
        contract.tenantName?.toLowerCase().includes(query) ||
        contract.contractNumber?.toLowerCase().includes(query) ||
        contract.propertyAddress?.toLowerCase().includes(query) ||
        contract.tenantEmail?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((contract: any) => contract.status === statusFilter);
    }

    setFilteredContracts(filtered);
  };

  const resetForm = () => {
    setFormData({
      contractNumber: '', tenantName: '', tenantEmail: '', tenantPhone: '',
      landlordName: '', landlordEmail: '', propertyAddress: '', propertyType: '',
      rentAmount: '', startDate: '', endDate: '', deposit: '',
      status: 'draft', accessCode: '', createdBy: 'landlord'
    });
    setSignatureImage(null);
    setSignaturePreview(null);
    setNationalIdImage(null);
    setNationalIdPreview(null);
    setUploadProgress({ signature: false, nationalId: false });
    setSelectedContract(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { 
        alert('حجم فایل باید کمتر از 10 مگابایت باشد'); 
        return; 
      }
      
      // Validate image quality for signature
      setUploadProgress(prev => ({ ...prev, signature: true }));
      const img = new Image();
      img.onload = () => {
        if (img.width < 150 || img.height < 50) {
          alert('کیفیت تصویر امضا باید حداقل 150x50 پیکسل باشد');
          setUploadProgress(prev => ({ ...prev, signature: false }));
          return;
        }
        
        setSignatureImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSignaturePreview(ev.target?.result);
          setUploadProgress(prev => ({ ...prev, signature: false }));
        };
        reader.readAsDataURL(file);
        addNotification('امضای شما با موفقیت آپلود شد', 'success');
      };
      
      img.onerror = () => {
        alert('فایل تصویری معتبر نیست');
      };
      
      img.src = URL.createObjectURL(file);
    } else {
      alert('لطفاً یک فایل تصویری معتبر انتخاب کنید');
    }
  };

  // NEW HANDLER for National ID
  const handleNationalIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { 
        alert('حجم فایل باید کمتر از 10 مگابایت باشد'); 
        return; 
      }
      
      // Validate image dimensions and quality
      setUploadProgress(prev => ({ ...prev, nationalId: true }));
      const img = new Image();
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          alert('کیفیت تصویر باید حداقل 200x200 پیکسل باشد');
          setUploadProgress(prev => ({ ...prev, nationalId: false }));
          return;
        }
        
        setNationalIdImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setNationalIdPreview(ev.target?.result);
          setUploadProgress(prev => ({ ...prev, nationalId: false }));
        };
        reader.readAsDataURL(file);
        addNotification('تصویر کارت ملی با موفقیت آپلود شد', 'success');
      };
      
      img.onerror = () => {
        alert('فایل تصویری معتبر نیست');
        setUploadProgress(prev => ({ ...prev, nationalId: false }));
      };
      
      img.src = URL.createObjectURL(file);
    } else {
      alert('لطفاً یک فایل تصویری معتبر انتخاب کنید');
    }
  };

  const createContract = async () => {
    if (!isFormComplete) return;

    const contractNumber = generateContractNumber();
    const accessCode = generateAccessCode();

    const contract = {
      ...formData,
      contractNumber,
      accessCode,
      signature: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      id: contractNumber
    };

    const updatedContracts = [...contracts, contract];
    await saveContracts(updatedContracts);
    
    addNotification(`قرارداد ${contractNumber} ایجاد شد و کد دسترسی به ${contract.tenantName} ارسال گردید`, 'success');
    alert(`قرارداد با موفقیت ایجاد شد!\n\nشماره قرارداد: ${contractNumber}\nکد دسترسی: ${accessCode}\n\nکد دسترسی به ایمیل مستأجر ارسال شد.`);
    
    setCurrentView('dashboard');
    resetForm();
  };

  const signContract = async () => {
    if (!isFormComplete || currentUser.role !== 'tenant') return;

    setIsLoading(true);

    const signedContract = {
      ...formData,
      signature: signaturePreview,
      nationalId: nationalIdPreview, // NEW: Include national ID
      status: 'signed',
      signedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedContracts = contracts.map((c: any) => 
      c.contractNumber === formData.contractNumber ? signedContract : c
    );

    await saveContracts(updatedContracts);
    
    setTimeout(() => {
      generatePDF(signedContract);
      setIsLoading(false);
      addNotification(`قرارداد ${formData.contractNumber} امضا شد و PDF به طرفین ارسال گردید`, 'success');
      alert('قرارداد با موفقیت امضا شد!\nفایل PDF به ایمیل شما و مالک ارسال شد.');
      
      setTimeout(() => {
        handleLogout();
      }, 2000);
    }, 2000);
  };

  const loadContract = (contract: any) => {
    setFormData(contract);
    if (contract.signature) {
      setSignaturePreview(contract.signature);
      setSignatureImage({ name: 'امضا' });
    }
    if (contract.nationalId) {
      setNationalIdPreview(contract.nationalId);
      setNationalIdImage({ name: 'کارت ملی' });
    }
    setSelectedContract(contract);
  };

  const deleteContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را حذف کنید؟')) {
      const updatedContracts = contracts.filter((c: any) => c.contractNumber !== contractNumber);
      await saveContracts(updatedContracts);
      addNotification(`قرارداد ${contractNumber} حذف شد`, 'warning');
    }
  };

  const terminateContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را فسخ کنید؟')) {
      const updatedContracts = contracts.map((c: any) => 
        c.contractNumber === contractNumber 
          ? { ...c, status: 'terminated', terminatedAt: new Date().toISOString() }
          : c
      );
      await saveContracts(updatedContracts);
      addNotification(`قرارداد ${contractNumber} فسخ شد`, 'warning');
    }
  };

  const resendAccessCode = (contract: any) => {
    addNotification(`کد دسترسی به ${contract.tenantName} ارسال شد`, 'info');
    alert('کد دسترسی به ایمیل مستأجر ارسال شد');
  };

  const generatePDF = (contract: any = null) => {
    const contractData = contract || formData;
    const printWindow = window.open('', '_blank');
    
    const pdfContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قرارداد اجاره ${contractData.contractNumber}</title>
        <style>
          * { font-family: 'Tahoma', Arial, sans-serif; }
          body { margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; height: 100px; border: 1px solid #333; text-align: center; padding: 10px; }
          .terms { font-size: 12px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>قرارداد اجاره مسکونی</h1>
          <p>شماره قرارداد: ${contractData.contractNumber}</p>
          <p>تاریخ تنظیم: ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
        
        <div class="section">
          <h3>اطلاعات طرفین قرارداد:</h3>
          <table>
            <tr><th>موجر (مالک)</th><td>${contractData.landlordName}</td></tr>
            <tr><th>ایمیل موجر</th><td>${contractData.landlordEmail}</td></tr>
            <tr><th>مستأجر</th><td>${contractData.tenantName}</td></tr>
            <tr><th>ایمیل مستأجر</th><td>${contractData.tenantEmail}</td></tr>
            <tr><th>تلفن مستأجر</th><td>${contractData.tenantPhone}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>مشخصات ملک:</h3>
          <table>
            <tr><th>آدرس</th><td>${contractData.propertyAddress}</td></tr>
            <tr><th>نوع ملک</th><td>${contractData.propertyType}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>شرایط مالی:</h3>
          <table>
            <tr><th>مبلغ اجاره ماهانه</th><td>${contractData.rentAmount} تومان</td></tr>
            <tr><th>مبلغ ودیعه</th><td>${contractData.deposit} تومان</td></tr>
            <tr><th>تاریخ شروع</th><td>${contractData.startDate}</td></tr>
            <tr><th>تاریخ پایان</th><td>${contractData.endDate}</td></tr>
          </table>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <strong>امضای موجر</strong><br><br>
            ${contractData.landlordName}<br>
            تاریخ: ...................
          </div>
          <div class="signature-box">
            <strong>امضای مستأجر</strong><br><br>
            ${contractData.tenantName}<br>
            تاریخ: ${contractData.signedAt ? new Date(contractData.signedAt).toLocaleDateString('fa-IR') : '..................'}
            ${contractData.signature ? '<br><img src="' + contractData.signature + '" style="max-width: 150px; max-height: 50px; margin-top: 10px;">' : ''}
          </div>
        </div>
        
        <div class="terms">
          <h4>شرایط عمومی:</h4>
          <p>1. مستأجر متعهد است مبلغ اجاره را تا تاریخ 5 هر ماه پرداخت نماید.</p>
          <p>2. هرگونه تغییر در ملک باید با اجازه کتبی موجر صورت گیرد.</p>
          <p>3. در صورت تخلف از شرایط قرارداد، موجر حق فسخ قرارداد را دارد.</p>
          <p>4. این قرارداد در ${new Date().toLocaleDateString('fa-IR')} تنظیم و امضا شده است.</p>
        </div>
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentUser?.role === 'landlord') {
        handleAdminLogin();
      } else {
        handleTenantLogin();
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('کپی شد', 'success');
  };

  const removeSignature = () => {
    setSignatureImage(null);
    setSignaturePreview(null);
    addNotification('امضا حذف شد', 'info');
  };

  const removeNationalId = () => {
    setNationalIdImage(null);
    setNationalIdPreview(null);
    addNotification('تصویر کارت ملی حذف شد', 'info');
  };

  if (!isAuthenticated) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">سیستم اجاره‌نامه</h1>
                <p className="text-sm text-gray-600">مدیریت حرفه‌ای قراردادها</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser.role === 'landlord' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Home className="w-4 h-4 inline ml-2" />
                    داشبورد
                  </button>
                  <button
                    onClick={() => { resetForm(); setCurrentView('form'); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'form' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Plus className="w-4 h-4 inline ml-2" />
                    قرارداد جدید
                  </button>
                  <button
                    onClick={() => setCurrentView('notifications')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Bell className="w-4 h-4 inline ml-2" />
                    اعلان‌ها
                    {notifications.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">
                    {currentUser.role === 'landlord' ? 'مدیر سیستم' : 'مستأجر'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="خروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'dashboard' && currentUser.role === 'landlord' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">داشبورد مدیریت</h2>
              <button
                onClick={loadContracts}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                بروزرسانی
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">کل قراردادها</p>
                    <p className="text-3xl font-bold text-gray-800">{contracts.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">فعال</p>
                    <p className="text-3xl font-bold text-green-600">{contracts.filter(c => c.status === 'active').length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">امضا شده</p>
                    <p className="text-3xl font-bold text-purple-600">{contracts.filter(c => c.status === 'signed').length}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">منقضی</p>
                    <p className="text-3xl font-bold text-red-600">{contracts.filter(c => c.status === 'terminated').length}</p>
                  </div>
                  <Archive className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h3 className="text-xl font-bold text-gray-800">مدیریت قراردادها</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="جستجو در قراردادها..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="draft">پیش‌نویس</option>
                      <option value="active">فعال</option>
                      <option value="signed">امضا شده</option>
                      <option value="terminated">منقضی</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredContracts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">قراردادی یافت نشد</h3>
                    <p className="text-gray-400">برای شروع، یک قرارداد جدید ایجاد کنید</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">شماره قرارداد</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">مستأجر</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ملک</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">مبلغ اجاره</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">وضعیت</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.contractNumber} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-gray-800">{contract.contractNumber}</span>
                              <button
                                onClick={() => copyToClipboard(contract.contractNumber)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="کپی شماره قرارداد"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">کد: {contract.accessCode}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">{contract.tenantName}</p>
                              <p className="text-sm text-gray-500">{contract.tenantEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-800 max-w-xs truncate" title={contract.propertyAddress}>
                              {contract.propertyAddress}
                            </p>
                            <p className="text-xs text-gray-500">{contract.propertyType}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">{contract.rentAmount?.toLocaleString()} تومان</p>
                            <p className="text-xs text-gray-500">ودیعه: {contract.deposit?.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                              contract.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              contract.status === 'terminated' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contract.status === 'signed' ? 'امضا شده' :
                               contract.status === 'active' ? 'فعال' :
                               contract.status === 'terminated' ? 'منقضی' :
                               'پیش‌نویس'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { loadContract(contract); setCurrentView('form'); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="مشاهده جزئیات"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => generatePDF(contract)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="دانلود PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {contract.status === 'active' && (
                                <button
                                  onClick={() => resendAccessCode(contract)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="ارسال مجدد کد"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              {contract.status !== 'signed' && contract.status !== 'terminated' && (
                                <>
                                  <button
                                    onClick={() => terminateContract(contract.contractNumber)}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="فسخ قرارداد"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteContract(contract.contractNumber)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="حذف قرارداد"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentUser.role === 'landlord' ? 'ایجاد قرارداد جدید' : 'بررسی و امضای قرارداد'}
                  </h2>
                  <p className="text-gray-600">
                    {currentUser.role === 'landlord' ? 'اطلاعات قرارداد را تکمیل کنید' : 'لطفاً اطلاعات را بررسی و قرارداد را امضا کنید'}
                  </p>
                </div>
              </div>
              
              {currentUser.role === 'landlord' && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  بازگشت به داشبورد
                </button>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    اطلاعات مستأجر
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی *</label>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="نام کامل مستأجر"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل *</label>
                      <input
                        type="email"
                        name="tenantEmail"
                        value={formData.tenantEmail}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="example@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تلفن</label>
                      <input
                        type="tel"
                        name="tenantPhone"
                        value={formData.tenantPhone}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="09123456789"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    اطلاعات موجر
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی *</label>
                      <input
                        type="text"
                        name="landlordName"
                        value={formData.landlordName}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="نام کامل موجر"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل *</label>
                      <input
                        type="email"
                        name="landlordEmail"
                        value={formData.landlordEmail}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="landlord@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    مشخصات ملک
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">آدرس کامل *</label>
                      <textarea
                        name="propertyAddress"
                        value={formData.propertyAddress}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 resize-none"
                        placeholder="آدرس دقیق ملک مورد اجاره"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">نوع ملک</label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="آپارتمان">آپارتمان</option>
                        <option value="خانه ویلایی">خانه ویلایی</option>
                        <option value="مغازه">مغازه</option>
                        <option value="دفتر کار">دفتر کار</option>
                        <option value="انبار">انبار</option>
                        <option value="سایر">سایر</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    شرایط مالی
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ اجاره ماهانه (تومان) *</label>
                      <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="5000000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ ودیعه (تومان) *</label>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        disabled={currentUser.role === 'tenant'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        placeholder="50000000"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ شروع *</label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          disabled={currentUser.role === 'tenant'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ پایان *</label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          disabled={currentUser.role === 'tenant'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== UPDATED SIGNATURE & ID UPLOAD SECTION ===== */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 mt-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                تایید و امضای قرارداد
              </h3>
              
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold">توجه مهم</span>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  جهت احراز هویت، لطفاً تصویر امضای خود را از روی یک کاغذ سفید بارگذاری کنید.
                  <br/>
                  <strong>در صورتی که تصویر کارت ملی خود را آپلود نمی‌کنید، حتماً شماره ملی خود را با دست و خوانا در زیر امضای خود بنویسید.</strong>
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">۱. آپلود امضا (اجباری)</h4>
                  <label className="block cursor-pointer">
                    <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${signaturePreview ? 'border-green-400 bg-green-50' : uploadProgress.signature ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-blue-400'}`}>
                      {uploadProgress.signature ? (
                        <div className="text-center p-4">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-blue-600 font-semibold text-sm">در حال پردازش...</p>
                        </div>
                      ) : signaturePreview ? (
                        <div className="text-center p-4">
                          <img src={signaturePreview} alt="پیش‌نمایش امضا" className="max-h-24 mx-auto mb-2"/>
                          <p className="text-green-600 font-semibold text-sm mb-2">امضا آپلود شد</p>
                          <button
                            onClick={(e) => { e.preventDefault(); removeSignature(); }}
                            className="text-red-500 hover:text-red-700 text-xs underline"
                          >
                            حذف امضا
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="font-semibold text-gray-600">برای آپلود کلیک کنید</p>
                          <p className="text-xs text-gray-500">از دوربین یا گالری</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">۲. آپلود کارت ملی (اختیاری)</h4>
                  <label className="block cursor-pointer">
                    <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${nationalIdPreview ? 'border-green-400 bg-green-50' : uploadProgress.nationalId ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-blue-400'}`}>
                      {uploadProgress.nationalId ? (
                        <div className="text-center p-4">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-blue-600 font-semibold text-sm">در حال پردازش...</p>
                        </div>
                      ) : nationalIdPreview ? (
                        <div className="text-center p-4">
                          <img src={nationalIdPreview} alt="پیش‌نمایش کارت ملی" className="max-h-24 mx-auto mb-2"/>
                          <p className="text-green-600 font-semibold text-sm mb-2">کارت ملی آپلود شد</p>
                          <button
                            onClick={(e) => { e.preventDefault(); removeNationalId(); }}
                            className="text-red-500 hover:text-red-700 text-xs underline"
                          >
                            حذف کارت ملی
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="font-semibold text-gray-600">برای آپلود کلیک کنید</p>
                          <p className="text-xs text-gray-500">جهت احراز هویت بهتر</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleNationalIdUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
              {currentUser.role === 'landlord' ? (
                <button
                  onClick={createContract}
                  disabled={!isFormComplete}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  ایجاد قرارداد و ارسال کد دسترسی
                </button>
              ) : (
                <button
                  onClick={signContract}
                  disabled={!isFormComplete || isLoading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      در حال پردازش...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      امضا و تایید نهایی قرارداد
                    </>
                  )}
                </button>
              )}
            </div>

            {!isFormComplete && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">تکمیل اطلاعات مورد نیاز</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  لطفاً تمام فیلدهای ضروری (*) و تصویر امضا را تکمیل کنید.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === 'notifications' && currentUser.role === 'landlord' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">اعلان‌ها و فعالیت‌ها</h2>
              <button
                onClick={() => setNotifications([])}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                پاک کردن همه
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">اعلانی وجود ندارد</h3>
                  <p className="text-gray-400">فعالیت‌های جدید در اینجا نمایش داده می‌شود</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.type === 'success' ? 'bg-green-100 text-green-600' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          notification.type === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                           notification.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                           notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                           <Clock className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleDateString('fa-IR')} - {new Date(notification.timestamp).toLocaleTimeString('fa-IR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessionalRentalSystem;