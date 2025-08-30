// API Configuration for Vercel Deployment
import axios from 'axios';

// Get API URL from environment variables - Vercel configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : ''
);
const IS_PRODUCTION = import.meta.env.VITE_ENVIRONMENT === 'production';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // JWT tokens instead of cookies for Vercel
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log errors in development
    if (!IS_PRODUCTION) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Authentication
  login: '/api/login',
  
  // Contracts
  contracts: '/api/contracts',
  signContract: (contractNumber: string) => `/api/contracts/${contractNumber}/sign`,
  
  // Charts and Analytics  
  incomeChart: '/api/charts/income',
  statusChart: '/api/charts/status',
  
  // Notifications
  notificationSettings: '/api/settings/notifications',
  testNotification: '/api/notifications/test',
  
  // Health check
  health: '/api/health',
};

export default api;