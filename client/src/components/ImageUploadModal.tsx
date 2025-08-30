import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import Modal from 'react-modal';
import { Camera, Upload, X, Check, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-image-crop/dist/ReactCrop.css';

// Set the app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageData: string, file: File) => void;
  title: string;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  title,
  aspectRatio,
  minWidth = 150,
  minHeight = 50
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream when camera tab is active
  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else if (stream) {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('دسترسی به دوربین امکان‌پذیر نیست');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setSelectedImage(imageData);
    
    // Create a file from the captured image
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setOriginalFile(file);
      }
    }, 'image/jpeg', 0.8);
    
    stopCamera();
    setActiveTab('upload'); // Switch to upload tab to show cropping interface
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از 10 مگابایت باشد');
      return;
    }

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!imgRef.current || !completedCrop || !originalFile) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.8);
  }, [completedCrop, originalFile]);

  const handleConfirm = async () => {
    if (!selectedImage || !originalFile) {
      toast.error('لطفاً ابتدا تصویری انتخاب کنید');
      return;
    }

    setIsProcessing(true);

    try {
      let finalImageData = selectedImage;
      
      if (completedCrop) {
        const croppedImageData = await getCroppedImg();
        if (croppedImageData) {
          finalImageData = croppedImageData;
        }
      }

      // Validate image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          toast.error(`کیفیت تصویر باید حداقل ${minWidth}x${minHeight} پیکسل باشد`);
          setIsProcessing(false);
          return;
        }
        
        onImageSelect(finalImageData, originalFile);
        handleClose();
        toast.success('تصویر با موفقیت انتخاب شد');
      };
      
      img.onerror = () => {
        toast.error('خطا در پردازش تصویر');
        setIsProcessing(false);
      };
      
      img.src = finalImageData;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('خطا در پردازش تصویر');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setCapturedImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFile(null);
    setIsProcessing(false);
    stopCamera();
    setActiveTab('upload');
    onClose();
  };

  const resetImage = () => {
    setSelectedImage(null);
    setCapturedImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="max-w-4xl mx-auto mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl outline-none max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            آپلود فایل
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            استفاده از دوربین
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    فایل تصویر را انتخاب کنید
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    فرمت‌های مجاز: JPG, PNG, GIF - حداکثر 10 مگابایت
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      ویرایش تصویر
                    </h3>
                    <button
                      onClick={resetImage}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      تصویر جدید
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspectRatio}
                      minWidth={minWidth}
                      minHeight={minHeight}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop preview"
                        src={selectedImage}
                        onLoad={onImageLoad}
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </ReactCrop>
                  </div>
                  
                  {completedCrop && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        پیش‌نمایش نهایی:
                      </p>
                      <div className="inline-block bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border dark:border-gray-600">
                        <canvas
                          ref={canvasRef}
                          style={{
                            width: Math.min(completedCrop.width, 200),
                            height: Math.min(completedCrop.height, 200),
                          }}
                          className="max-w-full max-h-48 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4">
              {!capturedImage ? (
                <div className="text-center">
                  <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  <button
                    onClick={capturePhoto}
                    disabled={!stream}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-5 h-5" />
                    عکس بگیرید
                  </button>
                  {!stream && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      در حال دسترسی به دوربین...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full max-h-80 object-contain mx-auto rounded-xl"
                  />
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setSelectedImage(null);
                        startCamera();
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      عکس جدید
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all font-medium"
          >
            انصراف
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedImage || isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                پردازش...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                تأیید و استفاده
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </Modal>
  );
};

export default ImageUploadModal;