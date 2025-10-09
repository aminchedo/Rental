import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContractProvider } from './context/ContractContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContractFormPage from './pages/ContractFormPage';
import TenantViewPage from './pages/TenantViewPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import FinancialsPage from './pages/FinancialsPage';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, setCurrentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const notification: Notification = { 
      id: Date.now(), 
      message, 
      type, 
      timestamp: new Date() 
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handleTenantLogin = (contract: any) => {
    const tenantUser = {
      role: 'tenant' as const,
      name: contract.tenantName,
      contractNumber: contract.contractNumber,
      contract: contract
    };
    setCurrentUser(tenantUser);
    setSelectedContract(contract);
    setCurrentView('tenant-view');
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setCurrentView('form');
  };

  const generatePDF = (contract: any) => {
    const contractData = contract;
    const printWindow = window.open('', '_blank');
    
    const pdfContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قرارداد اجاره ${contractData.contractNumber}</title>
        <style>
          * { font-family: 'Vazirmatn', 'Tahoma', Arial, sans-serif; }
          body { margin: 40px; line-height: 1.8; font-size: 14px; }
          .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1f2937; margin-bottom: 10px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section h3 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
          .signature-section { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-box { width: 250px; height: 120px; border: 2px solid #374151; text-align: center; padding: 15px; border-radius: 8px; }
          .signature-box strong { display: block; margin-bottom: 10px; color: #1f2937; }
          .terms { font-size: 12px; margin-top: 40px; background: #f9fafb; padding: 20px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: right; }
          th { background-color: #f3f4f6; font-weight: 600; color: #374151; }
          td { background-color: white; }
          .amount { font-weight: bold; color: #059669; }
          .date { color: #7c3aed; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 قرارداد اجاره مسکونی</h1>
          <p><strong>شماره قرارداد:</strong> ${contractData.contractNumber}</p>
          <p><strong>تاریخ تنظیم:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
        
        <div class="section">
          <h3>📋 اطلاعات طرفین قرارداد</h3>
          <table>
            <tr><th>موجر (مالک)</th><td>${contractData.landlordName}</td></tr>
            <tr><th>ایمیل موجر</th><td>${contractData.landlordEmail}</td></tr>
            <tr><th>تلفن موجر</th><td>${contractData.landlordPhone || 'وارد نشده'}</td></tr>
            <tr><th>مستأجر</th><td>${contractData.tenantName}</td></tr>
            <tr><th>ایمیل مستأجر</th><td>${contractData.tenantEmail}</td></tr>
            <tr><th>تلفن مستأجر</th><td>${contractData.tenantPhone || 'وارد نشده'}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>🏠 مشخصات ملک</h3>
          <table>
            <tr><th>آدرس کامل</th><td>${contractData.propertyAddress}</td></tr>
            <tr><th>نوع ملک</th><td>${contractData.propertyType || 'مسکونی'}</td></tr>
            <tr><th>متراژ</th><td>${contractData.propertySize || 'مشخص نشده'} متر مربع</td></tr>
            <tr><th>امکانات</th><td>${contractData.propertyFeatures || 'مشخص نشده'}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>💰 شرایط مالی</h3>
          <table>
            <tr><th>مبلغ اجاره ماهانه</th><td class="amount">${contractData.rentAmount} تومان</td></tr>
            <tr><th>مبلغ ودیعه</th><td class="amount">${contractData.deposit || '0'} تومان</td></tr>
            <tr><th>تاریخ شروع</th><td class="date">${contractData.startDate}</td></tr>
            <tr><th>تاریخ پایان</th><td class="date">${contractData.endDate}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>📝 شرایط اضافی</h3>
          <table>
            <tr><th>پرداخت هزینه‌های جانبی</th><td>${contractData.utilitiesIncluded || 'بر عهده مستأجر'}</td></tr>
            <tr><th>نگهداری حیوان خانگی</th><td>${contractData.petPolicy || 'مجاز نیست'}</td></tr>
            <tr><th>استعمال دخانیات</th><td>${contractData.smokingPolicy || 'مجاز نیست'}</td></tr>
          </table>
          ${contractData.notes ? `<p><strong>یادداشت‌های اضافی:</strong><br>${contractData.notes}</p>` : ''}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <strong>امضای موجر</strong>
            ${contractData.landlordName}<br>
            کد ملی: ${contractData.landlordNationalId || '.....................'}<br>
            تاریخ: .....................
          </div>
          <div class="signature-box">
            <strong>امضای مستأجر</strong>
            ${contractData.tenantName}<br>
            کد ملی: ${contractData.tenantNationalId || '.....................'}<br>
            تاریخ: ${contractData.signedAt ? new Date(contractData.signedAt).toLocaleDateString('fa-IR') : '.....................'}
            ${contractData.signature ? '<br><img src="' + contractData.signature + '" style="max-width: 180px; max-height: 60px; margin-top: 5px; border: 1px solid #ccc;">' : ''}
          </div>
        </div>
        
        <div class="terms">
          <h4>📜 شرایط عمومی قرارداد:</h4>
          <ul style="margin-right: 20px; line-height: 2;">
            <li>مستأجر متعهد است مبلغ اجاره را تا تاریخ 5 هر ماه پرداخت نماید.</li>
            <li>هرگونه تغییر، تعمیر یا بازسازی در ملک باید با اجازه کتبی موجر صورت گیرد.</li>
            <li>در صورت تأخیر در پرداخت اجاره، جریمه روزانه 0.1% از مبلغ اجاره اعمال خواهد شد.</li>
            <li>مستأجر موظف است ملک را در شرایط مناسب نگهداری و تحویل دهد.</li>
            <li>در صورت تخلف از شرایط قرارداد، موجر حق فسخ یکطرفه قرارداد را دارد.</li>
            <li>این قرارداد در ${new Date().toLocaleDateString('fa-IR')} تنظیم و امضا شده است.</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
          <p>این قرارداد توسط سیستم مدیریت املاک تولید شده است</p>
          <p>تاریخ تولید: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR')}</p>
        </div>
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleResendAccessCode = (contract: any) => {
    addNotification(`کد دسترسی مجدداً به ${contract.tenantName} ارسال شد`, 'success');
  };

  const resetForm = () => {
    setSelectedContract(null);
  };

  // Show loading spinner while authentication is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onTenantLogin={handleTenantLogin}
        addNotification={addNotification}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1f2937',
            color: '#fff',
            fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
            direction: 'rtl',
            textAlign: 'right',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          },
          success: {
            style: {
              background: '#059669',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
            },
          },
        }}
      />
      
      <Header 
        currentView={currentView}
        onNavigateToView={setCurrentView}
        onResetForm={resetForm}
        notifications={notifications}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {currentView === 'dashboard' && currentUser?.role === 'admin' && (
          <div className="animate-fade-in">
            <DashboardPage
              onEditContract={handleEditContract}
              onGeneratePDF={generatePDF}
              onResendAccessCode={handleResendAccessCode}
              addNotification={addNotification}
            />
          </div>
        )}

        {currentView === 'form' && (
          <div className="animate-fade-in">
            <ContractFormPage
              selectedContract={selectedContract}
              onNavigateToDashboard={() => setCurrentView('dashboard')}
              addNotification={addNotification}
            />
          </div>
        )}

        {currentView === 'tenant-view' && currentUser?.role === 'tenant' && (
          <div className="animate-fade-in">
            <TenantViewPage
              contract={currentUser.contract}
              addNotification={addNotification}
            />
          </div>
        )}

        {currentView === 'notifications' && currentUser?.role === 'admin' && (
          <div className="animate-fade-in">
            <NotificationsPage
              notifications={notifications}
              onClearNotifications={() => setNotifications([])}
            />
          </div>
        )}

        {currentView === 'settings' && currentUser?.role === 'admin' && (
          <div className="animate-fade-in">
            <SettingsPage
              addNotification={addNotification}
            />
          </div>
        )}

        {currentView === 'financials' && currentUser?.role === 'admin' && (
          <div className="animate-fade-in">
            <FinancialsPage
              addNotification={addNotification}
            />
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ContractProvider>
            <Router>
              <AppContent />
            </Router>
          </ContractProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;