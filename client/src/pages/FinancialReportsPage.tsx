import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  PieChart, BarChart3, RefreshCw, Plus, Edit, Trash2, Eye 
} from 'lucide-react';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseForm from '../components/ExpenseForm';
import axios from 'axios';

interface FinancialReportsPageProps {
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

interface Expense {
  id: number;
  contract_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  contractNumber?: string;
  tenantName?: string;
}

interface ExpenseSummary {
  category: string;
  count: number;
  total: number;
  average: number;
}

const FinancialReportsPage: React.FC<FinancialReportsPageProps> = ({ addNotification }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesSummary, setExpensesSummary] = useState<ExpenseSummary[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, summaryRes, monthlyRes] = await Promise.all([
        axios.get('http://localhost:5001/api/expenses', { withCredentials: true }),
        axios.get('http://localhost:5001/api/charts/expenses/summary', { withCredentials: true }),
        axios.get('http://localhost:5001/api/charts/expenses/monthly', { withCredentials: true })
      ]);

      setExpenses(expensesRes.data);
      setExpensesSummary(summaryRes.data);
      setMonthlyExpenses(monthlyRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      addNotification('خطا در بارگیری داده‌های مالی', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('آیا از حذف این هزینه اطمینان دارید؟')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`, {
        withCredentials: true
      });
      addNotification('هزینه با موفقیت حذف شد', 'success');
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      addNotification('خطا در حذف هزینه', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'عمومی': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'تعمیرات': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'نظافت': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'امنیت': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'بیمه': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'مالیات': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'مدیریت': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'تبلیغات': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'حقوقی': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'سایر': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors['سایر'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش‌های مالی</h1>
                <p className="text-gray-600 dark:text-gray-400">مدیریت و تحلیل هزینه‌ها</p>
              </div>
            </div>
            <button
              onClick={handleAddExpense}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              افزودن هزینه
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              خلاصه
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'expenses' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              لیست هزینه‌ها
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'charts' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              نمودارها
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">کل هزینه‌ها</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(getTotalExpenses())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تعداد هزینه‌ها</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {expenses.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">میانگین هزینه</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {expenses.length > 0 ? formatCurrency(getTotalExpenses() / expenses.length) : '0 تومان'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">خلاصه دسته‌بندی‌ها</h3>
              <div className="space-y-3">
                {expensesSummary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.count} مورد
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(item.total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        میانگین: {formatCurrency(item.average)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expenses List Tab */}
        {activeTab === 'expenses' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">لیست هزینه‌ها</h3>
                <button
                  onClick={handleAddExpense}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  هزینه جدید
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      شرح
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      مبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      دسته‌بندی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      تاریخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      قرارداد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {expense.contractNumber ? (
                          <div>
                            <div className="font-medium">{expense.contractNumber}</div>
                            <div className="text-xs">{expense.tenantName}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">عمومی</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expenses.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    هنوز هزینه‌ای ثبت نشده است
                  </p>
                  <button
                    onClick={handleAddExpense}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    اولین هزینه را ثبت کنید
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <ExpenseChart data={monthlyExpenses} isLoading={loading} />
          </div>
        )}

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onExpenseAdded={fetchData}
          addNotification={addNotification}
          editingExpense={editingExpense}
        />
      </div>
    </div>
  );
};

export default FinancialReportsPage;