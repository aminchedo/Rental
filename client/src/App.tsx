import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/animations.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContractProvider } from './context/ContractContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContractFormPage from './pages/ContractFormPage';
import TenantViewPage from './pages/TenantViewPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import Header from './components/Header';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, setCurrentUser } = useAuth();
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

  const handleResendAccessCode = (contract: any) => {
    addNotification(`کد دسترسی به ${contract.tenantName} ارسال شد`, 'info');
  };

  const resetForm = () => {
    setSelectedContract(null);
  };

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
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'Tahoma, Arial, sans-serif',
            direction: 'rtl',
            textAlign: 'right'
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
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
        {currentView === 'dashboard' && currentUser?.role === 'landlord' && (
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

        {currentView === 'notifications' && currentUser?.role === 'landlord' && (
          <div className="animate-fade-in">
            <NotificationsPage
              notifications={notifications}
              onClearNotifications={() => setNotifications([])}
            />
          </div>
        )}

        {currentView === 'settings' && currentUser?.role === 'landlord' && (
          <div className="animate-fade-in">
            <SettingsPage
              addNotification={addNotification}
            />
          </div>
        )}

        {currentView === 'financial-reports' && currentUser?.role === 'landlord' && (
          <div className="animate-fade-in">
            <FinancialReportsPage
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
    <ThemeProvider>
      <AuthProvider>
        <ContractProvider>
          <Router>
            <AppContent />
          </Router>
        </ContractProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;