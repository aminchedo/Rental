import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Archive, Star, RefreshCw, Search, 
  Folder, Copy, Eye, Download, Send, Trash2, TrendingUp, DollarSign
} from 'lucide-react';
import { useContracts } from '../context/ContractContext';
import IncomeChart from '../components/IncomeChart';
import StatusPieChart from '../components/StatusPieChart';
import ExpenseChart from '../components/ExpenseChart';
// import LoadingSpinner from '../components/LoadingSpinner';
import { SkeletonChart } from '../components/SkeletonLoader';
// import { useLoading } from '../hooks/useLoading';
import { api, endpoints } from '../config/api';

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
  const [expenseData, setExpenseData] = useState([]);
  // const [expensesData, setExpensesData] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  // const { loadingStates, setLoading, isLoading, withLoading } = useLoading();

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartsLoading(true);
        const [incomeResponse, statusResponse] = await Promise.all([
          api.get(endpoints.incomeChart),
          api.get(endpoints.statusChart)
        ]);
        
        setIncomeData(incomeResponse.data);
        setStatusData(statusResponse.data);
        // For now, set empty data for expenses until we implement expense endpoints
        setExpenseData([]);
        setExpensesSummary([]);
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

      {/* Contract Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">کل قراردادها</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">{contracts.length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">فعال</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{contracts.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">امضا شده</p>
              <p className="text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">{contracts.filter(c => c.status === 'signed').length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">منقضی</p>
              <p className="text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{contracts.filter(c => c.status === 'terminated').length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <Archive className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {expensesSummary.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 lg:p-6 shadow-lg border border-green-100 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-green-700 dark:text-green-300">درآمد ماهانه</p>
                <p className="text-xl lg:text-2xl font-bold text-green-800 dark:text-green-200">
                  {new Intl.NumberFormat('fa-IR').format(
                    incomeData.reduce((sum: number, item: any) => sum + item.income, 0)
                  )} تومان
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-4 lg:p-6 shadow-lg border border-red-100 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-red-700 dark:text-red-300">کل هزینه‌ها</p>
                <p className="text-xl lg:text-2xl font-bold text-red-800 dark:text-red-200">
                  {new Intl.NumberFormat('fa-IR').format(
                    expensesSummary.reduce((sum: number, item: any) => sum + item.total, 0)
                  )} تومان
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-200 dark:bg-red-800 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-red-700 dark:text-red-300" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6 shadow-lg border border-blue-100 dark:border-blue-800 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300">سود خالص</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {new Intl.NumberFormat('fa-IR').format(
                    incomeData.reduce((sum: number, item: any) => sum + item.income, 0) -
                    expensesSummary.reduce((sum: number, item: any) => sum + item.total, 0)
                  )} تومان
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2">
          {chartsLoading ? (
            <SkeletonChart />
          ) : (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <IncomeChart data={incomeData} isLoading={chartsLoading} />
            </div>
          )}
        </div>
        <div className="xl:col-span-1">
          {chartsLoading ? (
            <SkeletonChart />
          ) : (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <StatusPieChart data={statusData} isLoading={chartsLoading} />
            </div>
          )}
        </div>
      </div>

      {/* Expense Chart Section */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {chartsLoading ? (
          <SkeletonChart />
        ) : (
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <ExpenseChart data={expenseData} isLoading={chartsLoading} />
          </div>
        )}
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