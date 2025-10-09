import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-6">
              <AlertTriangle className="w-16 h-16 mx-auto" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">خطا در سیستم</h1>
            
            <p className="text-gray-600 mb-6">
              متأسفانه خطایی در سیستم رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید یا به صفحه اصلی بروید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRefresh}
                className="btn-primary flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بارگذاری مجدد
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex items-center justify-center"
              >
                <Home className="w-4 h-4 ml-2" />
                صفحه اصلی
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-right">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  جزئیات خطا (حالت توسعه)
                </summary>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-left overflow-auto">
                  <div className="font-bold mb-2">Error:</div>
                  <div className="mb-4 text-red-600">{this.state.error.toString()}</div>
                  
                  {this.state.errorInfo && (
                    <>
                      <div className="font-bold mb-2">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;