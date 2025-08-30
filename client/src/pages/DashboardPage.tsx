import React from 'react';
import { 
  FileText, CheckCircle, Archive, Star, Home, RefreshCw, Search, 
  Folder, Copy, Eye, Download, Send, Trash2 
} from 'lucide-react';
import { useContracts } from '../context/ContractContext';

interface DashboardPageProps {
  onNavigateToForm: () => void;
  onEditContract: (contract: any) => void;
  onGeneratePDF: (contract: any) => void;
  onResendAccessCode: (contract: any) => void;
  addNotification: (message: string, type?: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToForm,
  onEditContract,
  onGeneratePDF,
  onResendAccessCode,
  addNotification
}) => {
  const { 
    contracts, 
    filteredContracts, 
    isLoading,
    searchQuery,
    statusFilter,
    fetchContracts,
    deleteContract,
    terminateContract,
    setSearchQuery,
    setStatusFilter
  } = useContracts();

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
        <h2 className="text-3xl font-bold text-gray-800">داشبورد مدیریت</h2>
        <button
          onClick={fetchContracts}
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
                          onClick={() => onEditContract(contract)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onGeneratePDF(contract)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="دانلود PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {contract.status === 'active' && (
                          <button
                            onClick={() => onResendAccessCode(contract)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="ارسال مجدد کد"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {contract.status !== 'signed' && contract.status !== 'terminated' && (
                          <>
                            <button
                              onClick={() => handleTerminateContract(contract.contractNumber)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="فسخ قرارداد"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.contractNumber)}
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
  );
};

export default DashboardPage;