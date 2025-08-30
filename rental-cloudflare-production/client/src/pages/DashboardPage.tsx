import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onEditContract: (contract: any) => void;
  onGeneratePDF: (contract: any) => void;
  onResendAccessCode: (contract: any) => void;
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onEditContract,
  onGeneratePDF,
  onResendAccessCode,
  addNotification
}) => {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    signedContracts: 0,
    totalIncome: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const [contractsResponse, statsResponse] = await Promise.all([
        fetch('/api/contracts', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        setContracts(contractsData.contracts || contractsData || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.contracts || stats);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      addNotification('خطا در دریافت اطلاعات داشبورد', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <span className="badge badge-success">امضا شده</span>;
      case 'active':
        return <span className="badge badge-info">فعال</span>;
      case 'draft':
        return <span className="badge badge-warning">پیش‌نویس</span>;
      case 'terminated':
        return <span className="badge badge-error">فسخ شده</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount;
    return new Intl.NumberFormat('fa-IR').format(num) + ' تومان';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          سلام، {currentUser?.name} عزیز
        </h1>
        <p className="text-gray-600">خوش آمدید به داشبورد مدیریت املاک</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل قراردادها</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قراردادهای فعال</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeContracts}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">امضا شده</p>
              <p className="text-2xl font-bold text-purple-600">{stats.signedContracts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل درآمد</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalIncome || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Section */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">قراردادهای اخیر</h2>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pr-10 w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="active">فعال</option>
                <option value="signed">امضا شده</option>
                <option value="terminated">فسخ شده</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>شماره قرارداد</th>
                <th>مستأجر</th>
                <th>آدرس ملک</th>
                <th>مبلغ اجاره</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>هیچ قراردادی یافت نشد</p>
                    <p className="text-sm mt-2">برای شروع، قرارداد جدیدی ایجاد کنید</p>
                  </td>
                </tr>
              ) : (
                contracts.map((contract: any) => (
                  <tr key={contract.id} className="table-row-hover">
                    <td className="font-medium">{contract.contractNumber}</td>
                    <td>
                      <div>
                        <div className="font-medium">{contract.tenantName}</div>
                        <div className="text-sm text-gray-500">{contract.tenantEmail}</div>
                      </div>
                    </td>
                    <td className="max-w-xs truncate">{contract.propertyAddress}</td>
                    <td className="font-medium">{formatCurrency(contract.rentAmount)}</td>
                    <td>{getStatusBadge(contract.status)}</td>
                    <td>{new Date(contract.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => onGeneratePDF(contract)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="دانلود PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditContract(contract)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onResendAccessCode(contract)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="ارسال مجدد کد"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;