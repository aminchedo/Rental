// API Configuration for Cloudflare Workers
import axios from 'axios';
import toast from 'react-hot-toast';

// Get API URL from environment variables - using production Cloudflare endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rental-management-api.amin-chinisaz-edu.workers.dev';
const IS_PRODUCTION = import.meta.env.VITE_APP_ENV === 'production';

// Persian error messages for production
const API_ERRORS: Record<number, string> = {
  401: 'نام کاربری یا رمز عبور اشتباه است',
  403: 'دسترسی غیرمجاز',
  404: 'یافت نشد',
  500: 'خطای سرور',
  503: 'سرویس در دسترس نیست'
};

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // JWT tokens instead of cookies for Workers
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
    const status = error.response?.status;
    const message = API_ERRORS[status] || 'خطای ناشناخته';
    
    // Show Persian error toast notification
    if (status && status !== 401) {
      toast.error(message);
    }
    
    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast.error('جلسه شما منقضی شده است. لطفا دوباره وارد شوید');
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
  contractById: (id: number) => `/api/contracts/${id}`,
  signContract: (contractNumber: string) => `/api/contracts/${contractNumber}/sign`,
  
  // Charts and Analytics  
  incomeChart: '/api/charts/income',
  statusChart: '/api/charts/status',
  
  // Notifications
  notificationSettings: '/api/settings/notifications',
  testNotification: '/api/notifications/test',
  
  // Health check
  health: '/api/health',
  status: '/api/status',
};

// API helper functions for production use
export const apiHelpers = {
  // Admin login with real credentials
  adminLogin: async (username: string, password: string) => {
    const response = await api.post(endpoints.login, { username, password });
    return response.data;
  },

  // Tenant login with contract number and access code
  tenantLogin: async (contractNumber: string, accessCode: string) => {
    const response = await api.post(endpoints.login, { 
      contract_number: contractNumber, 
      access_code: accessCode 
    });
    return response.data;
  },

  // Get all contracts (admin only)
  getContracts: async () => {
    const response = await api.get(endpoints.contracts);
    return response.data;
  },

  // Create new contract
  createContract: async (contractData: any) => {
    const response = await api.post(endpoints.contracts, contractData);
    return response.data;
  },

  // Update contract
  updateContract: async (id: number, contractData: any) => {
    const response = await api.put(endpoints.contractById(id), contractData);
    return response.data;
  },

  // Delete contract
  deleteContract: async (id: number) => {
    const response = await api.delete(endpoints.contractById(id));
    return response.data;
  },

  // Sign contract
  signContract: async (contractNumber: string, signature: string, nationalIdImage?: string) => {
    const response = await api.post(endpoints.signContract(contractNumber), {
      signature,
      national_id_image: nationalIdImage
    });
    return response.data;
  },

  // Get income chart data
  getIncomeChart: async () => {
    const response = await api.get(endpoints.incomeChart);
    return response.data;
  },

  // Get status chart data
  getStatusChart: async () => {
    const response = await api.get(endpoints.statusChart);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get(endpoints.health);
    return response.data;
  },

  // Status check
  statusCheck: async () => {
    const response = await api.get(endpoints.status);
    return response.data;
  }
};

export default api;