import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Archive, Star, RefreshCw, Search, 
  Folder, Copy, Eye, Download, Send, Trash2 
} from 'lucide-react';
import { useContracts } from '../context/ContractContext';
import IncomeChart from '../components/IncomeChart';
import StatusPieChart from '../components/StatusPieChart';
import axios from 'axios';

interface DashboardPageProps {
  onEditContract: (contract: any) => void;
  onGeneratePDF: (contract: any) => void;
  onResendAccessCode: (contract: any) => void;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onEditContract,
  onGeneratePDF,
  onResendAccessCode,
  addNotification
}) => {
  const { 
    contracts, 
    filteredContracts,
    searchQuery,
    statusFilter,
    fetchContracts,
    deleteContract,
    terminateContract,
    setSearchQuery,
    setStatusFilter
  } = useContracts();

  const [incomeData, setIncomeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartsLoading(true);
        const [incomeResponse, statusResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/charts/income', { withCredentials: true }),
          axios.get('http://localhost:5001/api/charts/status', { withCredentials: true })
        ]);
        
        setIncomeData(incomeResponse.data);
        setStatusData(statusResponse.data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        addNotification('خطا در بارگذاری نمودارها', 'error');
      } finally {
        setChartsLoading(false);
      }
    };

    fetchChartData();
  }, [contracts, addNotification]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('کپی شد', 'success');
  };

  const handleDeleteContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را حذف کنید؟')) {
      try {
        await deleteContract(contractNumber);
        addNotification(`قرارداد ${contractNumber} حذف شد`, 'warning');
      } catch (error) {
        addNotification('خطا در حذف قرارداد', 'error');
      }
    }
  };

  const handleTerminateContract = async (contractNumber: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این قرارداد را فسخ کنید؟')) {
      try {
        await terminateContract(contractNumber);
        addNotification(`قرارداد ${contractNumber} فسخ شد`, 'warning');
      } catch (error) {
        addNotification('خطا در فسخ قرارداد', 'error');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">داشبورد مدیریت</h2>
        <button
          onClick={fetchContracts}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          بروزرسانی
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">کل قراردادها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{contracts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">فعال</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{contracts.filter(c => c.status === 'active').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">امضا شده</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{contracts.filter(c => c.status === 'signed').length}</p>
            </div>
            <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">منقضی</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{contracts.filter(c => c.status === 'terminated').length}</p>
            </div>
            <Archive className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IncomeChart data={incomeData} isLoading={chartsLoading} />
        </div>
        <div className="xl:col-span-1">
          <StatusPieChart data={statusData} isLoading={chartsLoading} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">مدیریت قراردادها</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در قراردادها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">قراردادی یافت نشد</h3>
              <p className="text-gray-400 dark:text-gray-500">برای شروع، یک قرارداد جدید ایجاد کنید</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">شماره قرارداد</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">مستأجر</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ملک</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">مبلغ اجاره</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">وضعیت</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContracts.map((contract) => (
                  <tr key={contract.contractNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-800 dark:text-white">{contract.contractNumber}</span>
                        <button
                          onClick={() => copyToClipboard(contract.contractNumber)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="کپی شماره قرارداد"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">کد: {contract.accessCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{contract.tenantName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contract.tenantEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 dark:text-white max-w-xs truncate" title={contract.propertyAddress}>
                        {contract.propertyAddress}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{contract.propertyType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800 dark:text-white">{contract.rentAmount?.toLocaleString()} تومان</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ودیعه: {contract.deposit?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'signed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        contract.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        contract.status === 'terminated' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
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
                          onClick={() => onEditContract(contract)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onGeneratePDF(contract)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="دانلود PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {contract.status === 'active' && (
                          <button
                            onClick={() => onResendAccessCode(contract)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="ارسال مجدد کد"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {contract.status !== 'signed' && contract.status !== 'terminated' && (
                          <>
                            <button
                              onClick={() => handleTerminateContract(contract.contractNumber)}
                              className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              title="فسخ قرارداد"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.contractNumber)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
  );
};

export default DashboardPage;