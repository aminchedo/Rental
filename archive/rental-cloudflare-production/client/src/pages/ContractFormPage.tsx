import React, { useState, useEffect } from 'react';
import { Save, ArrowRight, FileText, Mail, Phone, Home, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContractFormPageProps {
  selectedContract: any;
  onNavigateToDashboard: () => void;
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const ContractFormPage: React.FC<ContractFormPageProps> = ({
  selectedContract,
  onNavigateToDashboard,
  addNotification
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    tenantNationalId: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    landlordNationalId: '',
    propertyAddress: '',
    propertyType: 'مسکونی',
    propertySize: '',
    propertyFeatures: '',
    rentAmount: '',
    deposit: '',
    startDate: '',
    endDate: '',
    utilitiesIncluded: '',
    petPolicy: 'مجاز نیست',
    smokingPolicy: 'مجاز نیست',
    notes: ''
  });

  useEffect(() => {
    if (selectedContract) {
      setFormData(selectedContract);
    }
  }, [selectedContract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const isEdit = !!selectedContract;
      const url = isEdit ? `/api/contracts/${selectedContract.id}` : '/api/contracts';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const message = isEdit ? 'قرارداد با موفقیت بروزرسانی شد' : 'قرارداد با موفقیت ایجاد شد';
        
        toast.success(message);
        addNotification(message, 'success');
        
        if (!isEdit && data.contractNumber && data.accessCode) {
          addNotification(`شماره قرارداد: ${data.contractNumber} | کد دسترسی: ${data.accessCode}`, 'info');
        }
        
        onNavigateToDashboard();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'خطا در ذخیره قرارداد');
      }
    } catch (error) {
      console.error('Contract save error:', error);
      toast.error('خطا در ذخیره قرارداد');
      addNotification('خطا در ذخیره قرارداد', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedContract ? 'ویرایش قرارداد' : 'ایجاد قرارداد جدید'}
          </h1>
          <p className="text-gray-600">اطلاعات کامل قرارداد اجاره را وارد کنید</p>
        </div>
        <button
          onClick={onNavigateToDashboard}
          className="btn-secondary"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tenant Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 ml-2" />
            اطلاعات مستأجر
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">نام و نام خانوادگی *</label>
              <input
                type="text"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">ایمیل *</label>
              <input
                type="email"
                name="tenantEmail"
                value={formData.tenantEmail}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">تلفن همراه</label>
              <input
                type="tel"
                name="tenantPhone"
                value={formData.tenantPhone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label className="form-label">کد ملی</label>
              <input
                type="text"
                name="tenantNationalId"
                value={formData.tenantNationalId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Landlord Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 ml-2" />
            اطلاعات موجر
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">نام و نام خانوادگی *</label>
              <input
                type="text"
                name="landlordName"
                value={formData.landlordName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">ایمیل *</label>
              <input
                type="email"
                name="landlordEmail"
                value={formData.landlordEmail}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">تلفن همراه</label>
              <input
                type="tel"
                name="landlordPhone"
                value={formData.landlordPhone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label className="form-label">کد ملی</label>
              <input
                type="text"
                name="landlordNationalId"
                value={formData.landlordNationalId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 ml-2" />
            مشخصات ملک
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">آدرس کامل ملک *</label>
              <textarea
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                className="form-textarea"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">نوع ملک</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="مسکونی">مسکونی</option>
                  <option value="تجاری">تجاری</option>
                  <option value="اداری">اداری</option>
                  <option value="صنعتی">صنعتی</option>
                </select>
              </div>

              <div>
                <label className="form-label">متراژ (متر مربع)</label>
                <input
                  type="number"
                  name="propertySize"
                  value={formData.propertySize}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="form-label">امکانات</label>
                <input
                  type="text"
                  name="propertyFeatures"
                  value={formData.propertyFeatures}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="پارکینگ، انباری، آسانسور"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 ml-2" />
            شرایط مالی
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">مبلغ اجاره ماهانه (تومان) *</label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="form-label">مبلغ ودیعه (تومان)</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                className="form-input"
                placeholder="50000000"
              />
            </div>

            <div>
              <label className="form-label">تاریخ شروع قرارداد *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">تاریخ پایان قرارداد *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Terms */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">شرایط اضافی</h3>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">هزینه‌های جانبی</label>
              <input
                type="text"
                name="utilitiesIncluded"
                value={formData.utilitiesIncluded}
                onChange={handleInputChange}
                className="form-input"
                placeholder="آب، برق، گاز بر عهده مستأجر"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">نگهداری حیوان خانگی</label>
                <select
                  name="petPolicy"
                  value={formData.petPolicy}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="مجاز نیست">مجاز نیست</option>
                  <option value="مجاز است">مجاز است</option>
                  <option value="با هماهنگی">با هماهنگی موجر</option>
                </select>
              </div>

              <div>
                <label className="form-label">استعمال دخانیات</label>
                <select
                  name="smokingPolicy"
                  value={formData.smokingPolicy}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="مجاز نیست">مجاز نیست</option>
                  <option value="مجاز است">مجاز است</option>
                  <option value="فقط در فضای باز">فقط در فضای باز</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">یادداشت‌های اضافی</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                rows={4}
                placeholder="سایر شرایط و توافقات..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="btn-secondary"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال ذخیره...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                {selectedContract ? 'بروزرسانی قرارداد' : 'ایجاد قرارداد'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractFormPage;