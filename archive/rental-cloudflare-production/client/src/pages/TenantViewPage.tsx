import React, { useState } from 'react';
import { FileText, Download, Edit3, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TenantViewPageProps {
  contract: any;
  addNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const TenantViewPage: React.FC<TenantViewPageProps> = ({ contract, addNotification }) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [nationalIdImage, setNationalIdImage] = useState('');
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!signature) {
      toast.error('لطفاً امضای خود را وارد کنید');
      return;
    }

    setSigning(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/contracts/${contract.contractNumber}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          nationalIdImage
        }),
      });

      if (response.ok) {
        toast.success('قرارداد با موفقیت امضا شد');
        addNotification('قرارداد با موفقیت امضا شد', 'success');
        setShowSignatureModal(false);
        // Refresh page or update contract status
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'خطا در امضای قرارداد');
      }
    } catch (error) {
      console.error('Sign contract error:', error);
      toast.error('خطا در امضای قرارداد');
      addNotification('خطا در امضای قرارداد', 'error');
    } finally {
      setSigning(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fa-IR').format(parseInt(amount)) + ' تومان';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">قرارداد اجاره شما</h1>
        <p className="text-gray-600">شماره قرارداد: {contract.contractNumber}</p>
      </div>

      {/* Status Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">وضعیت قرارداد</h3>
            <p className="text-gray-600 mt-1">
              {contract.status === 'signed' ? 'قرارداد امضا شده است' : 'در انتظار امضای شما'}
            </p>
          </div>
          <div>
            {contract.status === 'signed' ? (
              <span className="badge badge-success">
                <CheckCircle className="w-4 h-4 ml-1" />
                امضا شده
              </span>
            ) : (
              <span className="badge badge-warning">
                <AlertCircle className="w-4 h-4 ml-1" />
                در انتظار امضا
              </span>
            )}
          </div>
        </div>

        {contract.status !== 'signed' && (
          <div className="mt-4">
            <button
              onClick={() => setShowSignatureModal(true)}
              className="btn-primary"
            >
              <Edit3 className="w-4 h-4 ml-2" />
              امضای قرارداد
            </button>
          </div>
        )}
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات شخصی</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">نام:</span>
              <span className="font-medium">{contract.tenantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ایمیل:</span>
              <span className="font-medium">{contract.tenantEmail}</span>
            </div>
            {contract.tenantPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">تلفن:</span>
                <span className="font-medium">{contract.tenantPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Property Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات ملک</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block">آدرس:</span>
              <span className="font-medium">{contract.propertyAddress}</span>
            </div>
            {contract.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-600">نوع ملک:</span>
                <span className="font-medium">{contract.propertyType}</span>
              </div>
            )}
            {contract.propertySize && (
              <div className="flex justify-between">
                <span className="text-gray-600">متراژ:</span>
                <span className="font-medium">{contract.propertySize} متر مربع</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Terms */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">شرایط مالی</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">اجاره ماهانه:</span>
              <span className="font-bold text-green-600">{formatCurrency(contract.rentAmount)}</span>
            </div>
            {contract.deposit && (
              <div className="flex justify-between">
                <span className="text-gray-600">ودیعه:</span>
                <span className="font-medium">{formatCurrency(contract.deposit)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contract Period */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مدت قرارداد</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">تاریخ شروع:</span>
              <span className="font-medium">{new Date(contract.startDate).toLocaleDateString('fa-IR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">تاریخ پایان:</span>
              <span className="font-medium">{new Date(contract.endDate).toLocaleDateString('fa-IR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Terms */}
      {(contract.notes || contract.petPolicy || contract.smokingPolicy) && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">شرایط اضافی</h3>
          <div className="space-y-3">
            {contract.petPolicy && (
              <div className="flex justify-between">
                <span className="text-gray-600">حیوان خانگی:</span>
                <span className="font-medium">{contract.petPolicy}</span>
              </div>
            )}
            {contract.smokingPolicy && (
              <div className="flex justify-between">
                <span className="text-gray-600">استعمال دخانیات:</span>
                <span className="font-medium">{contract.smokingPolicy}</span>
              </div>
            )}
            {contract.notes && (
              <div>
                <span className="text-gray-600 block mb-2">یادداشت‌ها:</span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{contract.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">امضای قرارداد</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="form-label">امضای دیجیتال *</label>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="امضای خود را اینجا بنویسید یا آپلود کنید..."
                  required
                />
                <p className="form-help">
                  امضای شما به عنوان تأیید پذیرش شرایط قرارداد در نظر گرفته خواهد شد.
                </p>
              </div>

              <div>
                <label className="form-label">تصویر کارت ملی (اختیاری)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setNationalIdImage(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="form-input"
                />
                <p className="form-help">
                  آپلود تصویر کارت ملی برای احراز هویت بهتر (اختیاری)
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4 space-x-reverse">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="btn-secondary"
              >
                انصراف
              </button>
              <button
                onClick={handleSign}
                disabled={signing || !signature}
                className="btn-primary"
              >
                {signing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    در حال امضا...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تأیید و امضا
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantViewPage;