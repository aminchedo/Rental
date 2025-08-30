import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertCircle, Upload, CreditCard, Shield 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';
import ImageUploadModal from '../components/ImageUploadModal';

interface TenantViewPageProps {
  contract: any;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const TenantViewPage: React.FC<TenantViewPageProps> = ({ contract, addNotification }) => {
  const { } = useAuth();
  const { signContract } = useContracts();
  
  const [signatureImage, setSignatureImage] = useState<any>(null);
  const [signaturePreview, setSignaturePreview] = useState<any>(null);
  const [, setNationalIdImage] = useState<any>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<any>(null);
  // Note: uploadProgress removed as it's handled by the new ImageUploadModal
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isNationalIdModalOpen, setIsNationalIdModalOpen] = useState(false);

  useEffect(() => {
    if (contract?.signature) {
      setSignaturePreview(contract.signature);
      setSignatureImage({ name: 'امضا' });
    }
    if (contract?.nationalId) {
      setNationalIdPreview(contract.nationalId);
      setNationalIdImage({ name: 'کارت ملی' });
    }
  }, [contract]);

  useEffect(() => {
    setIsFormComplete(!!signatureImage);
  }, [signatureImage]);

  // Note: Legacy upload handlers replaced by ImageUploadModal

  const removeSignature = () => {
    setSignatureImage(null);
    setSignaturePreview(null);
    addNotification('امضا حذف شد', 'info');
  };

  const removeNationalId = () => {
    setNationalIdImage(null);
    setNationalIdPreview(null);
    addNotification('تصویر کارت ملی حذف شد', 'info');
  };

  // Modal handlers for new upload experience
  const handleSignatureSelect = (imageData: string, file: File) => {
    setSignatureImage(file);
    setSignaturePreview(imageData);
    addNotification('امضای شما با موفقیت آپلود شد', 'success');
  };

  const handleNationalIdSelect = (imageData: string, file: File) => {
    setNationalIdImage(file);
    setNationalIdPreview(imageData);
    addNotification('تصویر کارت ملی با موفقیت آپلود شد', 'success');
  };

  // Note: PDF generation is handled by the parent component

  const signContractHandler = async () => {
    if (!isFormComplete) return;

    setIsLoading(true);

    try {
      await signContract(contract.contractNumber, signaturePreview);
      
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toast.error('خطا در امضای قرارداد');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">بررسی و امضای قرارداد</h2>
          <p className="text-gray-600 dark:text-gray-400">لطفاً اطلاعات را بررسی و قرارداد را امضا کنید</p>
        </div>
      </div>

      {/* Contract Details Display */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">اطلاعات مستأجر</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-800 dark:text-white">نام:</strong> {contract.tenantName}</p>
              <p><strong className="text-gray-800 dark:text-white">ایمیل:</strong> {contract.tenantEmail}</p>
              <p><strong className="text-gray-800 dark:text-white">تلفن:</strong> {contract.tenantPhone}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">اطلاعات موجر</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-800 dark:text-white">نام:</strong> {contract.landlordName}</p>
              <p><strong className="text-gray-800 dark:text-white">ایمیل:</strong> {contract.landlordEmail}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">مشخصات ملک</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-800 dark:text-white">آدرس:</strong> {contract.propertyAddress}</p>
              <p><strong className="text-gray-800 dark:text-white">نوع ملک:</strong> {contract.propertyType}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">شرایط مالی</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-800 dark:text-white">اجاره ماهانه:</strong> {contract.rentAmount?.toLocaleString()} تومان</p>
              <p><strong className="text-gray-800 dark:text-white">ودیعه:</strong> {contract.deposit?.toLocaleString()} تومان</p>
              <p><strong className="text-gray-800 dark:text-white">مدت قرارداد:</strong> {contract.startDate} تا {contract.endDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">حفظ حریم خصوصی</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              این اطلاعات صرفاً جهت حصول اطمینان از تعهد شما به موارد قرارداد دریافت می‌شود. حریم خصوصی شما کاملاً محفوظ خواهد ماند و این مدارک به هیچ عنوان مورد استفاده قرار نخواهند گرفت، مگر در صورت بروز دعاوی حقوقی علیه مستأجر.
            </p>
          </div>
        </div>
      </div>

      {/* Signature and National ID Upload Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          تایید و امضای قرارداد
        </h3>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">توجه مهم</span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
            جهت احراز هویت، لطفاً تصویر امضای خود را از روی یک کاغذ سفید بارگذاری کنید.
            <br/>
            <strong>در صورتی که تصویر کارت ملی خود را آپلود نمی‌کنید، حتماً شماره ملی خود را با دست و خوانا در زیر امضای خود بنویسید.</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">۱. آپلود امضا (اجباری)</h4>
            {signaturePreview ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-6">
                <div className="text-center">
                  <img src={signaturePreview} alt="پیش‌نمایش امضا" className="max-h-24 mx-auto mb-4 rounded-lg"/>
                  <p className="text-green-600 dark:text-green-400 font-semibold text-sm mb-3">امضا آپلود شد</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all"
                    >
                      تغییر امضا
                    </button>
                    <button
                      onClick={removeSignature}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all"
                    >
                      حذف امضا
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <div className="text-center p-4">
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                  <p className="font-semibold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    برای آپلود کلیک کنید
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    از دوربین یا گالری
                  </p>
                </div>
              </button>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">۲. آپلود کارت ملی (اختیاری)</h4>
            {nationalIdPreview ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-6">
                <div className="text-center">
                  <img src={nationalIdPreview} alt="پیش‌نمایش کارت ملی" className="max-h-24 mx-auto mb-4 rounded-lg"/>
                  <p className="text-green-600 dark:text-green-400 font-semibold text-sm mb-3">کارت ملی آپلود شد</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setIsNationalIdModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all"
                    >
                      تغییر کارت ملی
                    </button>
                    <button
                      onClick={removeNationalId}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all"
                    >
                      حذف کارت ملی
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsNationalIdModalOpen(true)}
                className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <div className="text-center p-4">
                  <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                  <p className="font-semibold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    برای آپلود کلیک کنید
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    جهت احراز هویت بهتر
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={signContractHandler}
          disabled={!isFormComplete || isLoading}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              در حال پردازش...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              امضا و تایید نهایی قرارداد
            </>
          )}
        </button>
      </div>

      {!isFormComplete && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-xl">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">تکمیل اطلاعات مورد نیاز</span>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
            لطفاً تصویر امضا را آپلود کنید.
          </p>
        </div>
      )}

      {/* Image Upload Modals */}
      <ImageUploadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onImageSelect={handleSignatureSelect}
        title="آپلود امضا"
        aspectRatio={3}
        minWidth={150}
        minHeight={50}
      />

      <ImageUploadModal
        isOpen={isNationalIdModalOpen}
        onClose={() => setIsNationalIdModalOpen(false)}
        onImageSelect={handleNationalIdSelect}
        title="آپلود کارت ملی"
        aspectRatio={1.6}
        minWidth={200}
        minHeight={200}
      />
    </div>
  );
};

export default TenantViewPage;