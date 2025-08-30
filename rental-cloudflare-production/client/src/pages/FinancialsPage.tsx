import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

interface Expense {
  id: number;
  contract_id?: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  receipt_image?: string;
  approved: boolean;
  contractNumber?: string;
  tenantName?: string;
  propertyAddress?: string;
  created_at: string;
}

interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  active_contracts: number;
  total_expense_records: number;
}

interface FinancialsPageProps {
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const FinancialsPage: React.FC<FinancialsPageProps> = ({ addNotification }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    total_income: 0,
    total_expenses: 0,
    net_profit: 0,
    active_contracts: 0,
    total_expense_records: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    period: '12',
    contract_id: ''
  });

  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    contract_id: '',
    approved: false
  });

  const expenseCategories = [
    'تعمیر و نگهداری',
    'تمیزکاری',
    'بیمه',
    'مالیات',
    'کمیسیون',
    'تبلیغات',
    'حقوقی',
    'سایر'
  ];

  const chartColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
  ];

  useEffect(() => {
    fetchFinancialData();
  }, [filters]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch expenses
      const expensesParams = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.contract_id && { contract_id: filters.contract_id })
      });

      const [expensesResponse, reportsResponse] = await Promise.all([
        fetch(`/api/expenses?${expensesParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/reports/financial?period=${filters.period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (expensesResponse.ok && reportsResponse.ok) {
        const expensesData = await expensesResponse.json();
        const reportsData = await reportsResponse.json();

        setExpenses(expensesData.expenses || []);
        setSummary(reportsData.summary || {
          total_income: 0,
          total_expenses: 0,
          net_profit: 0,
          active_contracts: 0,
          total_expense_records: 0
        });

        // Prepare chart data
        const incomeByMonth = {};
        const expensesByMonth = {};

        reportsData.income?.forEach((item: any) => {
          incomeByMonth[item.month] = item.income || 0;
        });

        reportsData.expenses?.forEach((item: any) => {
          if (!expensesByMonth[item.month]) {
            expensesByMonth[item.month] = 0;
          }
          expensesByMonth[item.month] += item.expenses || 0;
        });

        const allMonths = new Set([
          ...Object.keys(incomeByMonth),
          ...Object.keys(expensesByMonth)
        ]);

        const chartData = Array.from(allMonths).map(month => ({
          month,
          income: incomeByMonth[month] || 0,
          expenses: expensesByMonth[month] || 0,
          profit: (incomeByMonth[month] || 0) - (expensesByMonth[month] || 0)
        })).sort((a, b) => a.month.localeCompare(b.month));

        setChartData(chartData);
      } else {
        throw new Error('خطا در دریافت اطلاعات مالی');
      }
    } catch (error) {
      console.error('Fetch financial data error:', error);
      addNotification('خطا در دریافت اطلاعات مالی', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('هزینه با موفقیت ثبت شد');
        addNotification('هزینه با موفقیت ثبت شد', 'success');
        setShowAddExpense(false);
        setNewExpense({
          category: '',
          amount: '',
          description: '',
          expense_date: new Date().toISOString().split('T')[0],
          contract_id: '',
          approved: false
        });
        fetchFinancialData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'خطا در ثبت هزینه');
      }
    } catch (error) {
      console.error('Add expense error:', error);
      toast.error('خطا در ثبت هزینه');
      addNotification('خطا در ثبت هزینه', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('آیا از حذف این هزینه اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('هزینه با موفقیت حذف شد');
        addNotification('هزینه با موفقیت حذف شد', 'success');
        fetchFinancialData();
      } else {
        throw new Error('خطا در حذف هزینه');
      }
    } catch (error) {
      console.error('Delete expense error:', error);
      toast.error('خطا در حذف هزینه');
      addNotification('خطا در حذف هزینه', 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['تاریخ', 'دسته‌بندی', 'مبلغ', 'شرح', 'قرارداد', 'وضعیت'];
    const csvData = expenses.map(expense => [
      expense.expense_date,
      expense.category,
      expense.amount.toLocaleString('fa-IR'),
      expense.description,
      expense.contractNumber || 'عمومی',
      expense.approved ? 'تأیید شده' : 'در انتظار تأیید'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification('فایل CSV با موفقیت دانلود شد', 'success');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری اطلاعات مالی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">گزارش‌های مالی</h1>
          <p className="text-gray-600">مدیریت درآمد، هزینه‌ها و تحلیل سودآوری</p>
        </div>
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={exportToCSV}
            className="btn-outline-primary"
          >
            <Download className="w-4 h-4 ml-2" />
            دانلود CSV
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 ml-2" />
            هزینه جدید
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل درآمد</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_income)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل هزینه‌ها</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_expenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">سود خالص</p>
              <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.net_profit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${summary.net_profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قراردادهای فعال</p>
              <p className="text-2xl font-bold text-blue-600">{summary.active_contracts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">درآمد در مقابل هزینه‌ها</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(value)}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'income' ? 'درآمد' : name === 'expenses' ? 'هزینه' : 'سود'
                  ]}
                  labelStyle={{ direction: 'rtl' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">روند سودآوری</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'سود']}
                  labelStyle={{ direction: 'rtl' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="form-select"
            >
              <option value="all">همه</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">دوره زمانی</label>
            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="form-select"
            >
              <option value="3">3 ماه اخیر</option>
              <option value="6">6 ماه اخیر</option>
              <option value="12">12 ماه اخیر</option>
              <option value="24">24 ماه اخیر</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">جستجو</label>
            <input
              type="text"
              placeholder="جستجو در شرح هزینه‌ها..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">فهرست هزینه‌ها</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>دسته‌بندی</th>
                <th>مبلغ</th>
                <th>شرح</th>
                <th>قرارداد</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    هیچ هزینه‌ای ثبت نشده است
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="table-row-hover">
                    <td>
                      {new Date(expense.expense_date).toLocaleDateString('fa-IR')}
                    </td>
                    <td>
                      <span className="badge badge-gray">{expense.category}</span>
                    </td>
                    <td className="font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="max-w-xs truncate">{expense.description}</td>
                    <td>
                      {expense.contractNumber ? (
                        <div>
                          <div className="font-medium">{expense.contractNumber}</div>
                          <div className="text-sm text-gray-500">{expense.tenantName}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">عمومی</span>
                      )}
                    </td>
                    <td>
                      {expense.approved ? (
                        <span className="badge badge-success">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تأیید شده
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <AlertCircle className="w-3 h-3 ml-1" />
                          در انتظار تأیید
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ثبت هزینه جدید</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">دسته‌بندی *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="">انتخاب کنید</option>
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">مبلغ (تومان) *</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">تاریخ هزینه *</label>
                  <input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">شماره قرارداد (اختیاری)</label>
                  <input
                    type="text"
                    value={newExpense.contract_id}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, contract_id: e.target.value }))}
                    className="form-input"
                    placeholder="برای هزینه عمومی خالی بگذارید"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">شرح هزینه *</label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  rows={3}
                  placeholder="توضیحات کامل هزینه..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="approved"
                  checked={newExpense.approved}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, approved: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="approved" className="mr-2 text-sm text-gray-700">
                  هزینه تأیید شده است
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4 space-x-reverse">
              <button
                onClick={() => setShowAddExpense(false)}
                className="btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={handleAddExpense}
                className="btn-primary"
                disabled={!newExpense.category || !newExpense.amount || !newExpense.description}
              >
                ثبت هزینه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialsPage;