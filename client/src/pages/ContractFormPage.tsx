import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Building2, MapPin, DollarSign, CheckCircle, 
  AlertCircle, Home, Upload, CreditCard, Shield, ChevronRight, 
  ChevronLeft, Search, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';

interface ContractFormPageProps {
  selectedContract?: any;
  onNavigateToDashboard: () => void;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const ContractFormPage: React.FC<ContractFormPageProps> = ({
  selectedContract,
  onNavigateToDashboard
}) => {
  const { currentUser } = useAuth();
  const { addContract, signContract, lookupTenantByNationalId, lookupLandlordByNationalId } = useContracts();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    contractNumber: '', tenantName: '', tenantEmail: '', tenantPhone: '', tenantNationalId: '',
    landlordName: '', landlordEmail: '', landlordNationalId: '', propertyAddress: '', propertyType: '',
    rentAmount: '', startDate: '', endDate: '', deposit: '',
    status: 'draft', accessCode: '', createdBy: 'landlord'
  });
  
  const [signatureImage, setSignatureImage] = useState<any>(null);
  const [signaturePreview, setSignaturePreview] = useState<any>(null);
  const [, setNationalIdImage] = useState<any>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState({ signature: false, nationalId: false });
  const [isLoading, setIsLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState({ tenant: false, landlord: false });

  const steps = [
    { id: 1, title: 'اطلاعات موجر', icon: Building2 },
    { id: 2, title: 'اطلاعات مستأجر', icon: User },
    { id: 3, title: 'مشخصات ملک و اجاره', icon: MapPin },
    { id: 4, title: 'بررسی نهایی و ایجاد', icon: CheckCircle }
  ];

  useEffect(() => {
    if (selectedContract) {
      setFormData(selectedContract);
      if (selectedContract.signature) {
        setSignaturePreview(selectedContract.signature);
        setSignatureImage({ name: 'امضا' });
      }
      if (selectedContract.nationalId) {
        setNationalIdPreview(selectedContract.nationalId);
        setNationalIdImage({ name: 'کارت ملی' });
      }
    }
  }, [selectedContract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTenantNationalIdLookup = async (nationalId: string) => {
    if (!/^\d{10}$/.test(nationalId)) return;
    
    setLookupLoading(prev => ({ ...prev, tenant: true }));
    try {
      const tenantData = await lookupTenantByNationalId(nationalId);
      if (tenantData) {
        setFormData((prev: any) => ({
          ...prev,
          tenantName: tenantData.tenantName,
          tenantEmail: tenantData.tenantEmail,
          tenantPhone: tenantData.tenantPhone
        }));
        toast.success('اطلاعات مستأجر پیدا شد و فیلدها تکمیل شدند');
      }
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setLookupLoading(prev => ({ ...prev, tenant: false }));
    }
  };

  const handleLandlordNationalIdLookup = async (nationalId: string) => {
    if (!/^\d{10}$/.test(nationalId)) return;
    
    setLookupLoading(prev => ({ ...prev, landlord: true }));
    try {
      const landlordData = await lookupLandlordByNationalId(nationalId);
      if (landlordData) {
        setFormData((prev: any) => ({
          ...prev,
          landlordName: landlordData.landlordName,
          landlordEmail: landlordData.landlordEmail
        }));
        toast.success('اطلاعات موجر پیدا شد و فیلدها تکمیل شدند');
      }
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setLookupLoading(prev => ({ ...prev, landlord: false }));
    }
  };

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
        toast.success('امضای شما با موفقیت آپلود شد');
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
        toast.success('تصویر کارت ملی با موفقیت آپلود شد');
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
    toast.success('امضا حذف شد');
  };

  const removeNationalId = () => {
    setNationalIdImage(null);
    setNationalIdPreview(null);
    toast.success('تصویر کارت ملی حذف شد');
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Landlord Info
        return formData.landlordName && formData.landlordEmail;
      case 2: // Tenant Info
        return formData.tenantName && formData.tenantEmail;
      case 3: // Property & Rent Details
        return formData.propertyAddress && formData.rentAmount && formData.startDate && formData.endDate && formData.deposit;
      case 4: // Final Review
        return signatureImage;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createContractHandler = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      const contract = await addContract(formData);
      toast.success(`قرارداد ${contract.contractNumber} ایجاد شد و کد دسترسی به ${contract.tenantName} ارسال گردید`);
      
      onNavigateToDashboard();
      resetForm();
    } catch (error) {
      toast.error('خطا در ایجاد قرارداد');
    } finally {
      setIsLoading(false);
    }
  };

  const signContractHandler = async () => {
    if (!validateCurrentStep() || currentUser?.role !== 'tenant') return;

    setIsLoading(true);
    try {
      await signContract(formData.contractNumber, signaturePreview);
      
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

  const resetForm = () => {
    setFormData({
      contractNumber: '', tenantName: '', tenantEmail: '', tenantPhone: '', tenantNationalId: '',
      landlordName: '', landlordEmail: '', landlordNationalId: '', propertyAddress: '', propertyType: '',
      rentAmount: '', startDate: '', endDate: '', deposit: '',
      status: 'draft', accessCode: '', createdBy: 'landlord'
    });
    setSignatureImage(null);
    setSignaturePreview(null);
    setNationalIdImage(null);
    setNationalIdPreview(null);
    setUploadProgress({ signature: false, nationalId: false });
    setCurrentStep(1);
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isAccessible = currentStep >= step.id;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' :
                  isAccessible ? 'bg-gray-200 text-gray-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-green-600" />
        اطلاعات موجر
      </h3>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">کد ملی موجر</label>
          <div className="relative">
            <input
              type="text"
              name="landlordNationalId"
              value={formData.landlordNationalId}
              onChange={handleInputChange}
              onBlur={(e) => handleLandlordNationalIdLookup(e.target.value)}
              disabled={currentUser?.role === 'tenant'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="کد ملی 10 رقمی موجر"
              maxLength={10}
            />
            {lookupLoading.landlord && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-5 h-5 animate-spin text-green-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <Search className="w-3 h-3 inline ml-1" />
            با وارد کردن کد ملی، اطلاعات قبلی موجر بارگذاری می‌شود
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی *</label>
          <input
            type="text"
            name="landlordName"
            value={formData.landlordName}
            onChange={handleInputChange}
            disabled={currentUser?.role === 'tenant'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="نام کامل موجر"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل *</label>
          <input
            type="email"
            name="landlordEmail"
            value={formData.landlordEmail}
            onChange={handleInputChange}
            disabled={currentUser?.role === 'tenant'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="landlord@email.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        اطلاعات مستأجر
      </h3>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">کد ملی مستأجر</label>
          <div className="relative">
            <input
              type="text"
              name="tenantNationalId"
              value={formData.tenantNationalId}
              onChange={handleInputChange}
              onBlur={(e) => handleTenantNationalIdLookup(e.target.value)}
              disabled={currentUser?.role === 'tenant'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="کد ملی 10 رقمی مستأجر"
              maxLength={10}
            />
            {lookupLoading.tenant && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <Search className="w-3 h-3 inline ml-1" />
            با وارد کردن کد ملی، اطلاعات قبلی مستأجر بارگذاری می‌شود
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">نام و نام خانوادگی *</label>
          <input
            type="text"
            name="tenantName"
            value={formData.tenantName}
            onChange={handleInputChange}
            disabled={currentUser?.role === 'tenant'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="نام کامل مستأجر"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ایمیل *</label>
          <input
            type="email"
            name="tenantEmail"
            value={formData.tenantEmail}
            onChange={handleInputChange}
            disabled={currentUser?.role === 'tenant'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="example@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تلفن</label>
          <input
            type="tel"
            name="tenantPhone"
            value={formData.tenantPhone}
            onChange={handleInputChange}
            disabled={currentUser?.role === 'tenant'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="09123456789"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          مشخصات ملک
        </h3>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">آدرس کامل *</label>
            <textarea
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleInputChange}
              disabled={currentUser?.role === 'tenant'}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              placeholder="آدرس دقیق ملک مورد اجاره"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نوع ملک</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              disabled={currentUser?.role === 'tenant'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">انتخاب کنید</option>
              <option value="آپارتمان">آپارتمان</option>
              <option value="خانه ویلایی">خانه ویلایی</option>
              <option value="مغازه">مغازه</option>
              <option value="دفتر کار">دفتر کار</option>
              <option value="انبار">انبار</option>
              <option value="سایر">سایر</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-600" />
          شرایط مالی
        </h3>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ اجاره ماهانه (تومان) *</label>
            <input
              type="number"
              name="rentAmount"
              value={formData.rentAmount}
              onChange={handleInputChange}
              disabled={currentUser?.role === 'tenant'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="5000000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ ودیعه (تومان) *</label>
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleInputChange}
              disabled={currentUser?.role === 'tenant'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="50000000"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ شروع *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={currentUser?.role === 'tenant'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ پایان *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={currentUser?.role === 'tenant'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Contract Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">خلاصه قرارداد</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><strong>موجر:</strong> {formData.landlordName}</div>
          <div><strong>مستأجر:</strong> {formData.tenantName}</div>
          <div><strong>آدرس ملک:</strong> {formData.propertyAddress}</div>
          <div><strong>نوع ملک:</strong> {formData.propertyType}</div>
          <div><strong>اجاره ماهانه:</strong> {formData.rentAmount?.toLocaleString()} تومان</div>
          <div><strong>ودیعه:</strong> {formData.deposit?.toLocaleString()} تومان</div>
          <div><strong>مدت قرارداد:</strong> {formData.startDate} تا {formData.endDate}</div>
        </div>
      </div>

      {/* Signature and National ID Upload Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          تایید و امضای قرارداد
        </h3>
        
        {/* Privacy Notice - Only show for tenants */}
        {currentUser?.role === 'tenant' && (
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
        )}
        
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
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const renderNavigationButtons = () => (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
      <div className="flex gap-4 flex-1">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            قبلی
          </button>
        )}
        
        {currentStep < 4 && (
          <button
            onClick={nextStep}
            disabled={!validateCurrentStep()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            بعدی
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {currentStep === 4 && (
        currentUser?.role === 'landlord' ? (
          <button
            onClick={createContractHandler}
            disabled={!validateCurrentStep() || isLoading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال ایجاد...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                ایجاد قرارداد و ارسال کد دسترسی
              </>
            )}
          </button>
        ) : (
          <button
            onClick={signContractHandler}
            disabled={!validateCurrentStep() || isLoading}
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
        )
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentUser?.role === 'landlord' ? 'ایجاد قرارداد جدید' : 'بررسی و امضای قرارداد'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUser?.role === 'landlord' ? 'اطلاعات قرارداد را تکمیل کنید' : 'لطفاً اطلاعات را بررسی و قرارداد را امضا کنید'}
            </p>
          </div>
        </div>
        
        {currentUser?.role === 'landlord' && (
          <button
            onClick={onNavigateToDashboard}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            بازگشت به داشبورد
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      {renderNavigationButtons()}

      {/* Validation Warning */}
      {currentStep < 4 && !validateCurrentStep() && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">تکمیل اطلاعات مورد نیاز</span>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            لطفاً تمام فیلدهای ضروری (*) را تکمیل کنید تا بتوانید به مرحله بعد بروید.
          </p>
        </div>
      )}

      {currentStep === 4 && !validateCurrentStep() && (
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

export default ContractFormPage;