import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">خطا در بارگذاری سیستم</h1>
            <p className="text-gray-600 mb-4">
              متأسفانه خطایی در بارگذاری سیستم رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              بارگذاری مجدد
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  جزئیات خطا (حالت توسعه)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance monitoring
const startTime = performance.now()

// Initialize React App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Performance logging
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime
  console.log(`🚀 App loaded in ${loadTime.toFixed(2)}ms`)
  
  // Send performance metrics to analytics (if configured)
  if (window.gtag) {
    window.gtag('event', 'page_load_time', {
      custom_parameter: loadTime
    })
  }
})

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  // Store the event for later use
  ;(window as any).deferredPrompt = e
  
  // Show install button/banner
  console.log('PWA install prompt available')
})