import React, { useState, useEffect } from 'react';
import { Plus, Save, X, DollarSign, Calendar, FileText, Tag } from 'lucide-react';
import axios from 'axios';

interface Contract {
  id: string;
  contractNumber: string;
  tenantName: string;
}

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  editingExpense?: any;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  isOpen, 
  onClose, 
  onExpenseAdded, 
  addNotification,
  editingExpense 
}) => {
  const [formData, setFormData] = useState({
    contract_id: '',
    amount: '',
    description: '',
    category: 'عمومی',
    date: new Date().toISOString().split('T')[0]
  });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'عمومی',
    'تعمیرات',
    'نظافت',
    'امنیت',
    'بیمه',
    'مالیات',
    'مدیریت',
    'تبلیغات',
    'حقوقی',
    'سایر'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
      if (editingExpense) {
        setFormData({
          contract_id: editingExpense.contract_id || '',
          amount: editingExpense.amount.toString(),
          description: editingExpense.description,
          category: editingExpense.category,
          date: editingExpense.date
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingExpense]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/contracts', {
        withCredentials: true
      });
      setContracts(response.data.filter((contract: any) => contract.status === 'active'));
    } catch (error) {
      console.error('Error fetching contracts:', error);
      addNotification('خطا در بارگیری قراردادها', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contract_id: '',
      amount: '',
      description: '',
      category: 'عمومی',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      addNotification('لطفاً تمام فیلدهای الزامی را پر کنید', 'warning');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      addNotification('مبلغ باید بیشتر از صفر باشد', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await axios.put(`http://localhost:5001/api/expenses/${editingExpense.id}`, expenseData, {
          withCredentials: true
        });
        addNotification('هزینه با موفقیت به‌روزرسانی شد', 'success');
      } else {
        await axios.post('http://localhost:5001/api/expenses', expenseData, {
          withCredentials: true
        });
        addNotification('هزینه با موفقیت ثبت شد', 'success');
      }

      onExpenseAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      addNotification('خطا در ثبت هزینه', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingExpense ? 'ویرایش هزینه' : 'افزودن هزینه جدید'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              مبلغ (تومان) *
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="مبلغ هزینه را وارد کنید"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              شرح هزینه *
            </label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="توضیحات هزینه را وارد کنید"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              دسته‌بندی
            </label>
            <div className="relative">
              <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تاریخ هزینه *
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Contract Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              قرارداد مرتبط (اختیاری)
            </label>
            <select
              name="contract_id"
              value={formData.contract_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={loading}
            >
              <option value="">انتخاب قرارداد (هزینه عمومی)</option>
              {contracts.map(contract => (
                <option key={contract.id} value={contract.id}>
                  {contract.contractNumber} - {contract.tenantName}
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                در حال بارگیری قراردادها...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingExpense ? 'به‌روزرسانی' : 'ثبت هزینه'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;