import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertCircle, Upload, CreditCard, Shield 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';

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
  const [uploadProgress, setUploadProgress] = useState({ signature: false, nationalId: false });
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { 
        toast.error('حجم فایل باید کمتر از 10 مگابایت باشد'); 
        return; 
      }
      
      setUploadProgress(prev => ({ ...prev, signature: true }));
      const img = new Image();
      img.onload = () => {
        if (img.width < 150 || img.height < 50) {
          toast.error('کیفیت تصویر امضا باید حداقل 150x50 پیکسل باشد');
          setUploadProgress(prev => ({ ...prev, signature: false }));
          return;
        }
        
        setSignatureImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSignaturePreview(ev.target?.result);
          setUploadProgress(prev => ({ ...prev, signature: false }));
        };
        reader.readAsDataURL(file);
        addNotification('امضای شما با موفقیت آپلود شد', 'success');
      };
      
      img.onerror = () => {
        toast.error('فایل تصویری معتبر نیست');
        setUploadProgress(prev => ({ ...prev, signature: false }));
      };
      
      img.src = URL.createObjectURL(file);
    } else {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید');
    }
  };

  const handleNationalIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { 
        toast.error('حجم فایل باید کمتر از 10 مگابایت باشد'); 
        return; 
      }
      
      setUploadProgress(prev => ({ ...prev, nationalId: true }));
      const img = new Image();
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          toast.error('کیفیت تصویر باید حداقل 200x200 پیکسل باشد');
          setUploadProgress(prev => ({ ...prev, nationalId: false }));
          return;
        }
        
        setNationalIdImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setNationalIdPreview(ev.target?.result);
          setUploadProgress(prev => ({ ...prev, nationalId: false }));
        };
        reader.readAsDataURL(file);
        addNotification('تصویر کارت ملی با موفقیت آپلود شد', 'success');
      };
      
      img.onerror = () => {
        toast.error('فایل تصویری معتبر نیست');
        setUploadProgress(prev => ({ ...prev, nationalId: false }));
      };
      
      img.src = URL.createObjectURL(file);
    } else {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید');
    }
  };

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

  const generatePDF = (contractData: any) => {
    const printWindow = window.open('', '_blank');
    
    const pdfContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>قرارداد اجاره ${contractData.contractNumber}</title>
        <style>
          * { font-family: 'Tahoma', Arial, sans-serif; }
          body { margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; height: 100px; border: 1px solid #333; text-align: center; padding: 10px; }
          .terms { font-size: 12px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>قرارداد اجاره مسکونی</h1>
          <p>شماره قرارداد: ${contractData.contractNumber}</p>
          <p>تاریخ تنظیم: ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
        
        <div class="section">
          <h3>اطلاعات طرفین قرارداد:</h3>
          <table>
            <tr><th>موجر (مالک)</th><td>${contractData.landlordName}</td></tr>
            <tr><th>ایمیل موجر</th><td>${contractData.landlordEmail}</td></tr>
            <tr><th>مستأجر</th><td>${contractData.tenantName}</td></tr>
            <tr><th>ایمیل مستأجر</th><td>${contractData.tenantEmail}</td></tr>
            <tr><th>تلفن مستأجر</th><td>${contractData.tenantPhone}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>مشخصات ملک:</h3>
          <table>
            <tr><th>آدرس</th><td>${contractData.propertyAddress}</td></tr>
            <tr><th>نوع ملک</th><td>${contractData.propertyType}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>شرایط مالی:</h3>
          <table>
            <tr><th>مبلغ اجاره ماهانه</th><td>${contractData.rentAmount} تومان</td></tr>
            <tr><th>مبلغ ودیعه</th><td>${contractData.deposit} تومان</td></tr>
            <tr><th>تاریخ شروع</th><td>${contractData.startDate}</td></tr>
            <tr><th>تاریخ پایان</th><td>${contractData.endDate}</td></tr>
          </table>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <strong>امضای موجر</strong><br><br>
            ${contractData.landlordName}<br>
            تاریخ: ...................
          </div>
          <div class="signature-box">
            <strong>امضای مستأجر</strong><br><br>
            ${contractData.tenantName}<br>
            تاریخ: ${contractData.signedAt ? new Date(contractData.signedAt).toLocaleDateString('fa-IR') : '..................'}
            ${contractData.signature ? '<br><img src="' + contractData.signature + '" style="max-width: 150px; max-height: 50px; margin-top: 10px;">' : ''}
          </div>
        </div>
        
        <div class="terms">
          <h4>شرایط عمومی:</h4>
          <p>1. مستأجر متعهد است مبلغ اجاره را تا تاریخ 5 هر ماه پرداخت نماید.</p>
          <p>2. هرگونه تغییر در ملک باید با اجازه کتبی موجر صورت گیرد.</p>
          <p>3. در صورت تخلف از شرایط قرارداد، موجر حق فسخ قرارداد را دارد.</p>
          <p>4. این قرارداد در ${new Date().toLocaleDateString('fa-IR')} تنظیم و امضا شده است.</p>
        </div>
      </body>
      </html>
    `;
    
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

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
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">بررسی و امضای قرارداد</h2>
          <p className="text-gray-600">لطفاً اطلاعات را بررسی و قرارداد را امضا کنید</p>
        </div>
      </div>

      {/* Contract Details Display */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات مستأجر</h3>
            <div className="space-y-3">
              <p><strong>نام:</strong> {contract.tenantName}</p>
              <p><strong>ایمیل:</strong> {contract.tenantEmail}</p>
              <p><strong>تلفن:</strong> {contract.tenantPhone}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات موجر</h3>
            <div className="space-y-3">
              <p><strong>نام:</strong> {contract.landlordName}</p>
              <p><strong>ایمیل:</strong> {contract.landlordEmail}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">مشخصات ملک</h3>
            <div className="space-y-3">
              <p><strong>آدرس:</strong> {contract.propertyAddress}</p>
              <p><strong>نوع ملک:</strong> {contract.propertyType}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">شرایط مالی</h3>
            <div className="space-y-3">
              <p><strong>اجاره ماهانه:</strong> {contract.rentAmount?.toLocaleString()} تومان</p>
              <p><strong>ودیعه:</strong> {contract.deposit?.toLocaleString()} تومان</p>
              <p><strong>مدت قرارداد:</strong> {contract.startDate} تا {contract.endDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">حفظ حریم خصوصی</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              این اطلاعات صرفاً جهت حصول اطمینان از تعهد شما به موارد قرارداد دریافت می‌شود. حریم خصوصی شما کاملاً محفوظ خواهد ماند و این مدارک به هیچ عنوان مورد استفاده قرار نخواهند گرفت، مگر در صورت بروز دعاوی حقوقی علیه مستأجر.
            </p>
          </div>
        </div>
      </div>

      {/* Signature and National ID Upload Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          تایید و امضای قرارداد
        </h3>
        
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">توجه مهم</span>
          </div>
          <p className="text-blue-700 text-sm mt-2">
            جهت احراز هویت، لطفاً تصویر امضای خود را از روی یک کاغذ سفید بارگذاری کنید.
            <br/>
            <strong>در صورتی که تصویر کارت ملی خود را آپلود نمی‌کنید، حتماً شماره ملی خود را با دست و خوانا در زیر امضای خود بنویسید.</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">۱. آپلود امضا (اجباری)</h4>
            <label className="block cursor-pointer">
              <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${signaturePreview ? 'border-green-400 bg-green-50' : uploadProgress.signature ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-blue-400'}`}>
                {uploadProgress.signature ? (
                  <div className="text-center p-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-blue-600 font-semibold text-sm">در حال پردازش...</p>
                  </div>
                ) : signaturePreview ? (
                  <div className="text-center p-4">
                    <img src={signaturePreview} alt="پیش‌نمایش امضا" className="max-h-24 mx-auto mb-2"/>
                    <p className="text-green-600 font-semibold text-sm mb-2">امضا آپلود شد</p>
                    <button
                      onClick={(e) => { e.preventDefault(); removeSignature(); }}
                      className="text-red-500 hover:text-red-700 text-xs underline"
                    >
                      حذف امضا
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">برای آپلود کلیک کنید</p>
                    <p className="text-xs text-gray-500">از دوربین یا گالری</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            </label>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">۲. آپلود کارت ملی (اختیاری)</h4>
            <label className="block cursor-pointer">
              <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${nationalIdPreview ? 'border-green-400 bg-green-50' : uploadProgress.nationalId ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-blue-400'}`}>
                {uploadProgress.nationalId ? (
                  <div className="text-center p-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-blue-600 font-semibold text-sm">در حال پردازش...</p>
                  </div>
                ) : nationalIdPreview ? (
                  <div className="text-center p-4">
                    <img src={nationalIdPreview} alt="پیش‌نمایش کارت ملی" className="max-h-24 mx-auto mb-2"/>
                    <p className="text-green-600 font-semibold text-sm mb-2">کارت ملی آپلود شد</p>
                    <button
                      onClick={(e) => { e.preventDefault(); removeNationalId(); }}
                      className="text-red-500 hover:text-red-700 text-xs underline"
                    >
                      حذف کارت ملی
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">برای آپلود کلیک کنید</p>
                    <p className="text-xs text-gray-500">جهت احراز هویت بهتر</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleNationalIdUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
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
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">تکمیل اطلاعات مورد نیاز</span>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            لطفاً تصویر امضا را آپلود کنید.
          </p>
        </div>
      )}
    </div>
  );
};

export default TenantViewPage;