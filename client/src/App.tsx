import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, Upload, FileText, Download, User, Home, Calendar, DollarSign, 
  CheckCircle, AlertCircle, LogOut, Archive, Eye, Trash2, Edit, 
  Users, Key, Lock, Folder, Search, Filter, RefreshCw, Plus, Mail,
  Shield, QrCode, Clock, Zap, Settings, Send, Copy, Star,
  Building2, Receipt, UserCheck, Phone, MapPin, CreditCard
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

interface Contract {
  id: string;
  contractNumber: string;
  accessCode: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordName: string;
  landlordEmail: string;
  propertyAddress: string;
  propertyType: string;
  rentAmount: string;
  startDate: string;
  endDate: string;
  deposit: string;
  status: string;
  signature: string | null;
  createdAt: string;
  lastModified: string;
  signedAt?: string;
  terminatedAt?: string;
  createdBy: string;
}

interface User {
  username?: string;
  password?: string;
  role: string;
  name: string;
  contractNumber?: string;
  contract?: Contract;
}

interface Notification {
  id: number;
  message: string;
  type: string;
  timestamp: Date;
}

const ProfessionalRentalSystem = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ contractNumber: '', accessCode: '' });
  const [formData, setFormData] = useState({
    contractNumber: '', tenantName: '', tenantEmail: '', tenantPhone: '',
    landlordName: '', landlordEmail: '', propertyAddress: '', propertyType: '',
    rentAmount: '', startDate: '', endDate: '', deposit: '',
    status: 'draft', accessCode: '', createdBy: 'landlord'
  });
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // NEW STATE for National ID
  const [nationalIdImage, setNationalIdImage] = useState<File | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);

  const adminUser = { username: 'admin', password: 'admin', role: 'landlord', name: 'مدیر سیستم' };

  const generateContractNumber = () => `RNT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();
  
  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/contracts`);
      setContracts(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts([]);
      setIsLoading(false);
      addNotification('خطا در بارگذاری قراردادها', 'error');
    }
  };

  const saveContracts = async (updatedContracts: Contract[]) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/contracts`, updatedContracts);
      setContracts(updatedContracts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving contracts:', error);
      setIsLoading(false);
      addNotification('خطا در ذخیره اطلاعات', 'error');
    }
  };

  useEffect(() => { 
    if (isAuthenticated) { 
      loadContracts(); 
    } 
  }, [isAuthenticated]);

  useEffect(() => { 
    filterContracts(); 
  }, [contracts, searchQuery, statusFilter, currentUser]);

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
    const contract = serverContracts.find((c: Contract) => c.contractNumber === contractNumber && c.accessCode === accessCode && c.status !== 'terminated');
    if (contract) {
      if (contract.status === 'signed') { 
        alert('این قرارداد قبلاً امضا شده و دیگر قابل دسترسی نیست'); 
        return; 
      }
      setCurrentUser({ 
        role: 'tenant', 
        name: contract.tenantName, 
        contractNumber: contractNumber, 
        contract: contract 
      });
      setIsAuthenticated(true);
      setCurrentView('form');
      loadContract(contract);
      addNotification(`مستأجر ${contract.tenantName} وارد شد`, 'success');
    } else {
      alert('شماره قرارداد یا کد دسترسی اشتباه است یا قرارداد منقضی شده');
    }
  };

  const handleLogout = () => {
    addNotification(`${currentUser?.name} از سیستم خارج شد`, 'info');
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

    // Role-based filtering
    if (currentUser.role === 'tenant') {
      filtered = contracts.filter(contract => 
        contract.contractNumber === currentUser.contractNumber
      );
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.tenantName.toLowerCase().includes(query) ||
        contract.contractNumber.toLowerCase().includes(query) ||
        contract.propertyAddress.toLowerCase().includes(query) ||
        contract.tenantEmail.toLowerCase().includes(query)
      );
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
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
    setSelectedContract(null);
    // Reset new ID state
    setNationalIdImage(null);
    setNationalIdPreview(null);
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
      setSignatureImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setSignaturePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      addNotification('امضای شما با موفقیت آپلود شد', 'success');
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
      setNationalIdImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setNationalIdPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      addNotification('تصویر کارت ملی با موفقیت آپلود شد', 'success');
    } else {
      alert('لطفاً یک فایل تصویری معتبر انتخاب کنید');
    }
  };

  const createContract = async () => {
    if (!isFormComplete) return;

    const contractNumber = generateContractNumber();
    const accessCode = generateAccessCode();

    const contract: Contract = {
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
    
    // Simulate email sending
    simulateEmailSend(
      contract.tenantEmail,
      'کد دسترسی قرارداد اجاره شما',
      `
        سلام ${contract.tenantName} عزیز،
        
        قرارداد اجاره شما آماده امضا است:
        
        شماره قرارداد: ${contractNumber}
        کد دسترسی: ${accessCode}
        
        برای امضای قرارداد از لینک سیستم استفاده کنید.
        
        با تشکر،
        ${contract.landlordName}
      `
    );
    
    addNotification(`قرارداد ${contractNumber} ایجاد شد و کد دسترسی به ${contract.tenantName} ارسال گردید`, 'success');
    alert(`قرارداد با موفقیت ایجاد شد!\n\nشماره قرارداد: ${contractNumber}\nکد دسترسی: ${accessCode}\n\nکد دسترسی به ایمیل مستأجر ارسال شد.`);
    
    setCurrentView('dashboard');
    resetForm();
  };

  const signContract = async () => {
    if (!isFormComplete || currentUser?.role !== 'tenant') return;

    setIsLoading(true);

    const signedContract: Contract = {
      ...formData,
      signature: signaturePreview,
      status: 'signed',
      signedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    } as Contract;

    const updatedContracts = contracts.map(c => 
      c.contractNumber === formData.contractNumber ? signedContract : c
    );

    await saveContracts(updatedContracts);
    
    // Generate and send PDF
    setTimeout(() => {
      generatePDF(signedContract);
      
      // Simulate PDF email sending
      simulateEmailSend(
        signedContract.tenantEmail,
        'قرارداد امضا شده شما',
        `
          سلام ${signedContract.tenantName} عزیز،
          
          قرارداد شما با موفقیت امضا شد.
          فایل PDF قرارداد در پیوست ارسال شده است.
          
          شماره قرارداد: ${signedContract.contractNumber}
          تاریخ امضا: ${new Date().toLocaleDateString('fa-IR')}
          
          با تشکر،
          ${signedContract.landlordName}
        `
      );
      
      // Send copy to landlord
      simulateEmailSend(
        signedContract.landlordEmail,
        `قرارداد ${signedContract.contractNumber} امضا شد`,
        `
          سلام،
          
          قرارداد شماره ${signedContract.contractNumber} توسط ${signedContract.tenantName} امضا شد.
          
          جزئیات:
          - مستأجر: ${signedContract.tenantName}
          - ملک: ${signedContract.propertyAddress}
          - تاریخ امضا: ${new Date().toLocaleDateString('fa-IR')}
          
          فایل PDF قرارداد در پیوست ارسال شده است.
        `
      );
      
      setIsLoading(false);
      addNotification(`قرارداد ${formData.contractNumber} امضا شد و PDF به طرفین ارسال گردید`, 'success');
      alert('قرارداد با موفقیت امضا شد!\nفایل PDF به ایمیل شما و مالک ارسال شد.');
      
      // Log out tenant after signing
      setTimeout(() => {
        handleLogout();
      }, 2000);
    }, 2000);
  };

  const loadContract = (contract: Contract) => {
    setFormData(contract);
    if (contract.signature) {
      setSignaturePreview(contract.signature);
      setSignatureImage({ name: 'امضا' } as File);
    }
    setSelectedContract(contract);
  };

  const deleteContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را حذف کنید؟')) {
      const updatedContracts = contracts.filter(c => c.contractNumber !== contractNumber);
      await saveContracts(updatedContracts);
      addNotification(`قرارداد ${contractNumber} حذف شد`, 'warning');
    }
  };

  const terminateContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را فسخ کنید؟')) {
      const updatedContracts = contracts.map(c => 
        c.contractNumber === contractNumber 
          ? { ...c, status: 'terminated', terminatedAt: new Date().toISOString() }
          : c
      );
      await saveContracts(updatedContracts);
      addNotification(`قرارداد ${contractNumber} فسخ شد`, 'warning');
    }
  };

  const resendAccessCode = (contract: Contract) => {
    simulateEmailSend(
      contract.tenantEmail,
      'یادآوری کد دسترسی قرارداد اجاره',
      `
        سلام ${contract.tenantName} عزیز،
        
        کد دسترسی قرارداد اجاره شما:
        
        شماره قرارداد: ${contract.contractNumber}
        کد دسترسی: ${contract.accessCode}
        
        برای امضای قرارداد از لینک سیستم استفاده کنید.
        
        با تشکر،
        ${contract.landlordName}
      `
    );
    
    addNotification(`کد دسترسی به ${contract.tenantName} ارسال شد`, 'info');
    alert('کد دسترسی به ایمیل مستأجر ارسال شد');
  };

  const simulateEmailSend = (to: string, subject: string, body: string) => {
    console.log('📧 Email Sent:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  };

  const generatePDF = (contract: Contract | null = null) => {
    const contractData = contract || formData;
    const printWindow = window.open('', '_blank');
    
    const pdfContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
        <head>
          <title>قرارداد اجاره - ${contractData.contractNumber}</title>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Vazirmatn', 'Tahoma', Arial, sans-serif;
              direction: rtl; text-align: right; padding: 40px; line-height: 1.9;
              color: #1a202c; background: #ffffff; font-size: 14px; font-weight: 400;
            }
            .document-header {
              text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .main-title { font-size: 32px; font-weight: 800; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .contract-number {
              background: rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 25px;
              font-size: 16px; font-weight: 600; margin: 10px; display: inline-block; backdrop-filter: blur(10px);
            }
            .status-badge {
              background: #10b981; color: white; padding: 6px 16px; border-radius: 20px;
              font-size: 14px; font-weight: 600; margin-top: 10px; display: inline-block;
            }
            .info-section {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px;
              border-radius: 16px; margin: 30px 0; border: 3px solid #e2e8f0;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative;
            }
            .info-section::before {
              content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 6px;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;
            }
            .section-title {
              color: #2d3748; font-size: 20px; font-weight: 700; margin-bottom: 25px;
              text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;
            }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item {
              background: white; padding: 18px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              border: 1px solid #e2e8f0; transition: all 0.3s ease;
            }
            .info-label {
              font-weight: 600; color: #4a5568; font-size: 13px; margin-bottom: 8px;
              text-transform: uppercase; letter-spacing: 0.5px;
            }
            .info-value { color: #1a202c; font-size: 16px; font-weight: 500; line-height: 1.5; }
            .amount-highlight {
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              background-clip: text; font-weight: 700; font-size: 18px;
            }
            .contract-terms {
              background: white; padding: 35px; border: 2px solid #e2e8f0; border-radius: 16px;
              margin: 35px 0; text-align: justify; line-height: 2.1; box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            }
            .contract-terms h3 {
              color: #2d3748; text-align: center; margin-bottom: 30px; font-size: 22px; font-weight: 700;
            }
            .contract-terms p {
              margin-bottom: 20px; text-indent: 30px; font-size: 15px; color: #2d3748;
            }
            .signature-section {
              margin-top: 50px; padding: 35px; border: 3px dashed #cbd5e0; border-radius: 16px;
              text-align: center; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); position: relative;
            }
            .signature-title { color: #2d3748; margin-bottom: 25px; font-size: 20px; font-weight: 700; }
            .signature-image {
              max-width: 400px; max-height: 200px; border: 3px solid #e2e8f0; border-radius: 12px;
              margin: 20px auto; display: block; box-shadow: 0 8px 20px rgba(0,0,0,0.12);
            }
            .signature-info { margin-top: 25px; font-size: 15px; color: #4a5568; font-weight: 500; }
            .signature-date {
              background: #667eea; color: white; padding: 8px 16px; border-radius: 20px;
              display: inline-block; margin-top: 10px; font-weight: 600;
            }
            .document-footer {
              margin-top: 60px; text-align: center; font-size: 13px; color: #718096;
              padding-top: 30px; border-top: 2px solid #e2e8f0;
            }
            .footer-logo {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              background-clip: text; font-weight: 800; font-size: 16px; margin-bottom: 10px;
            }
            @page { margin: 2.5cm; size: A4; }
            @media print {
              body { padding: 20px; font-size: 13px; }
              .info-section, .contract-terms, .signature-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="main-title">📋 قرارداد اجاره ملک مسکونی</div>
            <div class="contract-number">🏠 شماره قرارداد: ${contractData.contractNumber}</div>
            <div class="contract-number">📅 تاریخ تنظیم: ${new Date().toLocaleDateString('fa-IR')}</div>
            <div class="status-badge">
              ${contractData.status === 'signed' ? '✅ امضا شده' : 
                contractData.status === 'active' ? '🔄 فعال' :
                contractData.status === 'terminated' ? '❌ فسخ شده' : '📝 پیش‌نویس'}
            </div>
          </div>
          
          <div class="info-section">
            <h3 class="section-title">👥 مشخصات طرفین قرارداد</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">👤 نام و نام خانوادگی مستأجر</div>
                <div class="info-value">${contractData.tenantName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📧 ایمیل مستأجر</div>
                <div class="info-value">${contractData.tenantEmail}</div>
              </div>
              <div class="info-item">
                <div class="info-label">👨‍💼 نام و نام خانوادگی موجر</div>
                <div class="info-value">${contractData.landlordName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📧 ایمیل موجر</div>
                <div class="info-value">${contractData.landlordEmail}</div>
              </div>
            </div>
            ${contractData.tenantPhone ? `
              <div class="info-item">
                <div class="info-label">📱 شماره تماس مستأجر</div>
                <div class="info-value">${contractData.tenantPhone}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="info-section">
            <h3 class="section-title">🏢 مشخصات ملک</h3>
            <div class="info-item">
              <div class="info-label">📍 آدرس کامل ملک</div>
              <div class="info-value">${contractData.propertyAddress}</div>
            </div>
            ${contractData.propertyType ? `
              <div class="info-item" style="margin-top: 15px;">
                <div class="info-label">🏠 نوع ملک</div>
                <div class="info-value">${contractData.propertyType}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="info-section">
            <h3 class="section-title">💰 جزئیات مالی و زمانی</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">💵 مبلغ اجاره ماهانه</div>
                <div class="info-value amount-highlight">${contractData.rentAmount.toLocaleString('fa-IR')} تومان</div>
              </div>
              <div class="info-item">
                <div class="info-label">💎 مبلغ ودیعه</div>
                <div class="info-value amount-highlight">${contractData.deposit.toLocaleString('fa-IR')} تومان</div>
              </div>
              <div class="info-item">
                <div class="info-label">📅 تاریخ شروع اجاره</div>
                <div class="info-value">${contractData.startDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📅 تاریخ پایان اجاره</div>
                <div class="info-value">${contractData.endDate}</div>
              </div>
            </div>
          </div>
          
          <div class="contract-terms">
            <h3>📜 شرایط و مفاد قرارداد</h3>
            <p><strong>ماده 1:</strong> بدینوسیله قرارداد اجاره بین آقای/خانم <strong>${contractData.landlordName}</strong> به عنوان موجر (طرف اول) و آقای/خانم <strong>${contractData.tenantName}</strong> به عنوان مستأجر (طرف دوم) منعقد می‌گردد.</p>
            <p><strong>ماده 2:</strong> موضوع اجاره ملک واقع در آدرس <strong>${contractData.propertyAddress}</strong> می‌باشد که مستأجر متعهد به استفاده مناسب و حفظ و نگهداری آن در طول مدت اجاره می‌باشد.</p>
            <p><strong>ماده 3:</strong> مدت اجاره از تاریخ <strong>${contractData.startDate}</strong> آغاز شده و در تاریخ <strong>${contractData.endDate}</strong> خاتمه می‌یابد. در صورت نیاز به تمدید، باید حداکثر یک ماه قبل از انقضا توافق جدید منعقد گردد.</p>
            <p><strong>ماده 4:</strong> مبلغ اجاره ماهانه <strong class="amount-highlight">${contractData.rentAmount.toLocaleString('fa-IR')} تومان</strong> تعیین گردیده که مستأجر متعهد به پرداخت آن تا پایان هر ماه می‌باشد. همچنین مبلغ <strong class="amount-highlight">${contractData.deposit.toLocaleString('fa-IR')} تومان</strong> به عنوان ودیعه دریافت شده است.</p>
            <p><strong>ماده 5:</strong> مستأجر مکلف است از ملک مراقبت کامل به عمل آورده و هرگونه خسارت وارده را جبران نماید. همچنین حق انتقال اجاره به شخص ثالث را بدون موافقت کتبی موجر نخواهد داشت.</p>
            <p><strong>ماده 6:</strong> این قرارداد در تاریخ <strong>${new Date().toLocaleDateString('fa-IR')}</strong> تنظیم و با امضای طرفین لازم الاجرا می‌باشد. کلیه تغییرات و الحاقات باید به صورت کتبی و با توافق طرفین انجام گیرد.</p>
          </div>
          
          ${contractData.signature ? `
            <div class="signature-section">
              <h3 class="signature-title">✍️ امضای مستأجر</h3>
              <img src="${contractData.signature}" alt="امضای مستأجر" class="signature-image">
              <div class="signature-info">
                <div><strong>${contractData.tenantName}</strong></div>
                <div class="signature-date">
                  📅 تاریخ امضا: ${contractData.signedAt ? new Date(contractData.signedAt).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR')}
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="document-footer">
            <div class="footer-logo">🏠 سیستم مدیریت اجاره‌نامه حرفه‌ای</div>
            <p>📄 این سند در تاریخ ${new Date().toLocaleDateString('fa-IR')} توسط سیستم الکترونیکی تنظیم شده است</p>
            <p>🔒 تمامی حقوق قانونی طرفین محفوظ و قابل پیگیری می‌باشد</p>
            <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">
              سیستم پیشرفته مدیریت اجاره‌نامه | نسخه 2.0
            </p>
          </div>
        </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (loginForm.contractNumber === 'admin') {
        handleAdminLogin();
      } else {
        handleTenantLogin();
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('کپی شد!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              سیستم مدیریت اجاره‌نامه
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              سیستم حرفه‌ای مدیریت و امضای الکترونیک قراردادهای اجاره
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                شماره قرارداد یا نام کاربری مدیر
              </label>
              <div className="relative">
                <QrCode className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.contractNumber}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, contractNumber: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="مثال: RNT1234567890 یا admin"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                کد دسترسی یا رمز عبور
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={loginForm.accessCode}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, accessCode: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="کد 6 رقمی یا admin"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => loginForm.contractNumber === 'admin' ? handleAdminLogin() : handleTenantLogin()}
                disabled={!loginForm.contractNumber || !loginForm.accessCode}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                ورود
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              راهنمای ورود
            </h3>
            <div className="text-sm text-blue-700 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold">مدیر سیستم (مالک):</p>
                  <p className="text-xs">admin / admin</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-purple-800 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold">مستأجر:</p>
                  <p className="text-xs">شماره قرارداد + کد دسترسی 6 رقمی</p>
                </div>
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
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  سیستم مدیریت اجاره‌نامه
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {currentUser?.name}
                  {currentUser?.role === 'tenant' && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      قرارداد: {currentUser.contractNumber}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {currentUser?.role === 'landlord' && (
                <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      currentView === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    داشبورد
                  </button>
                  
                  <button
                    onClick={() => {
                      resetForm();
                      setCurrentView('form');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      currentView === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    قرارداد جدید
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('notifications')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      currentView === 'notifications' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    اعلان‌ها
                    {notifications.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors bg-gray-100 px-4 py-2 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'dashboard' && currentUser?.role === 'landlord' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">کل قراردادها</p>
                    <p className="text-3xl font-bold text-gray-900">{contracts.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">فعال</p>
                    <p className="text-3xl font-bold text-green-600">
                      {contracts.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">امضا شده</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {contracts.filter(c => c.status === 'signed').length}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">درآمد ماهانه</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {contracts
                        .filter(c => c.status === 'signed')
                        .reduce((sum, c) => sum + parseInt(c.rentAmount), 0)
                        .toLocaleString('fa-IR')} ت
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <CreditCard className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="جستجو در قراردادها (نام، ایمیل، شماره قرارداد)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="active">فعال (در انتظار امضا)</option>
                  <option value="signed">امضا شده</option>
                  <option value="terminated">فسخ شده</option>
                </select>
                
                <button
                  onClick={loadContracts}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  بروزرسانی
                </button>
              </div>
            </div>

            {/* Contracts List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  مدیریت قراردادها
                </h3>
              </div>
              
              {filteredContracts.length === 0 ? (
                <div className="text-center py-16">
                  <Folder className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">قراردادی یافت نشد</p>
                  <p className="text-gray-500 text-sm mt-2">برای شروع، قرارداد جدیدی ایجاد کنید</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">شماره قرارداد</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">مستأجر</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">ایمیل</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">اجاره</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">تاریخ شروع</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">وضعیت</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.contractNumber} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-medium text-gray-900">
                                {contract.contractNumber}
                              </span>
                              <button
                                onClick={() => copyToClipboard(contract.contractNumber)}
                                className="text-gray-400 hover:text-gray-600"
                                title="کپی شماره قرارداد"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {contract.tenantName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {contract.tenantEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                            {parseInt(contract.rentAmount).toLocaleString('fa-IR')} تومان
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {contract.startDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                                contract.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                contract.status === 'terminated' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {contract.status === 'signed' ? 'امضا شده' :
                               contract.status === 'active' ? 'در انتظار امضا' :
                               contract.status === 'terminated' ? 'فسخ شده' : 'پیش‌نویس'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1 space-x-reverse">
                              <button
                                onClick={() => {
                                  loadContract(contract);
                                  setCurrentView('form');
                                }}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="مشاهده/ویرایش"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => generatePDF(contract)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                title="دانلود PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              {contract.status === 'active' && (
                                <button
                                  onClick={() => resendAccessCode(contract)}
                                  className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                  title="ارسال مجدد کد دسترسی"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              
                              {contract.status !== 'terminated' && (
                                <button
                                  onClick={() => terminateContract(contract.contractNumber)}
                                  className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                                  title="فسخ قرارداد"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteContract(contract.contractNumber)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="حذف قرارداد"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                {currentUser?.role === 'tenant' ? 'امضای قرارداد' : 
                 selectedContract ? 'ویرایش قرارداد' : 'ایجاد قرارداد جدید'}
              </h2>
              <p className="text-gray-600 text-lg">
                {currentUser?.role === 'tenant' 
                  ? 'لطفاً اطلاعات را بررسی کرده و در پایان امضای خود را آپلود نمایید'
                  : 'تمام اطلاعات مورد نیاز را با دقت تکمیل کنید'}
              </p>
            </div>

            {/* Contract Form Fields */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Tenant Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                  <User className="w-5 h-5 text-blue-600" />
                  اطلاعات مستأجر
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی مستأجر *</label>
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="نام کامل مستأجر را وارد کنید"
                    disabled={currentUser?.role === 'tenant'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل مستأجر *</label>
                  <input
                    type="email"
                    name="tenantEmail"
                    value={formData.tenantEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                    disabled={currentUser?.role === 'tenant'}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تماس مستأجر</label>
                  <input
                    type="tel"
                    name="tenantPhone"
                    value={formData.tenantPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="09123456789"
                    disabled={currentUser?.role === 'tenant'}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Landlord Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                  <Building2 className="w-5 h-5 text-green-600" />
                  اطلاعات موجر
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی موجر *</label>
                  <input
                    type="text"
                    name="landlordName"
                    value={formData.landlordName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="نام کامل موجر را وارد کنید"
                    disabled={currentUser?.role === 'tenant'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل موجر *</label>
                  <input
                    type="email"
                    name="landlordEmail"
                    value={formData.landlordEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="landlord@email.com"
                    disabled={currentUser?.role === 'tenant'}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200 mb-6">
                <Home className="w-5 h-5 text-purple-600" />
                اطلاعات ملک
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">آدرس کامل ملک *</label>
                  <textarea
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="آدرس دقیق و کامل ملک مورد اجاره"
                    disabled={currentUser?.role === 'tenant'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نوع ملک</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={currentUser?.role === 'tenant'}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="آپارتمان">آپارتمان</option>
                    <option value="خانه ویلایی">خانه ویلایی</option>
                    <option value="واحد تجاری">واحد تجاری</option>
                    <option value="دفتر کار">دفتر کار</option>
                    <option value="انبار">انبار</option>
                    <option value="سایر">سایر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial & Date Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200 mb-6">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                اطلاعات مالی و زمانی
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ اجاره ماهانه (تومان) *</label>
                  <input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: 5000000"
                    disabled={currentUser?.role === 'tenant'}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ ودیعه (تومان) *</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: 50000000"
                    disabled={currentUser?.role === 'tenant'}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ شروع اجاره *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={currentUser?.role === 'tenant'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ پایان اجاره *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={currentUser?.role === 'tenant'}
                  />
                </div>
              </div>
            </div>

            {/* UPDATED SIGNATURE & ID UPLOAD SECTION */}
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
                    <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${signaturePreview ? 'border-green-400 bg-green-50' : 'border-gray-400 hover:border-blue-400'}`}>
                      {signaturePreview ? (
                        <div className="text-center p-4">
                          <img src={signaturePreview} alt="پیش‌نمایش امضا" className="max-h-24 mx-auto mb-2"/>
                          <p className="text-green-600 font-semibold text-sm">امضا آپلود شد</p>
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
                    <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${nationalIdPreview ? 'border-green-400 bg-green-50' : 'border-gray-400 hover:border-blue-400'}`}>
                      {nationalIdPreview ? (
                        <div className="text-center p-4">
                          <img src={nationalIdPreview} alt="پیش‌نمایش کارت ملی" className="max-h-24 mx-auto mb-2"/>
                          <p className="text-green-600 font-semibold text-sm">کارت ملی آپلود شد</p>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              {currentUser?.role === 'landlord' ? (
                <>
                  <button
                    onClick={createContract}
                    disabled={!isFormComplete}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {selectedContract ? 'بروزرسانی قرارداد' : 'ایجاد قرارداد و ارسال کد دسترسی'}
                  </button>
                  <button
                    onClick={() => generatePDF()}
                    disabled={!isFormComplete}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    پیش‌نمایش PDF
                  </button>
                </>
              ) : (
                <button
                  onClick={signContract}
                  disabled={!isFormComplete || isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      در حال پردازش...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      امضای قرارداد و ارسال PDF
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Warning for incomplete form */}
            {!isFormComplete && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold">فرم ناقص</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  لطفاً تمام فیلدهای اجباری (*) را تکمیل کرده و امضای خود را آپلود کنید.
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === 'notifications' && currentUser?.role === 'landlord' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                اعلان‌ها و فعالیت‌ها
              </h2>
              
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">اعلانی موجود نیست</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border ${
                        notification.type === 'success' ? 'bg-green-50 border-green-200' :
                        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        notification.type === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'error' ? 'bg-red-100' :
                            'bg-blue-100'
                          }`}
                        >
                          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                           notification.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-600" /> :
                           notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                           <Zap className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{notification.message}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {new Date(notification.timestamp).toLocaleString('fa-IR')}
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