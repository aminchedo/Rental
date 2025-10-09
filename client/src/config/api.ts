// API Configuration for AI Chat & Monitoring System
import axios from 'axios';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const IS_PRODUCTION = import.meta.env.VITE_ENVIRONMENT === 'production';

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
  
  // AI Chat
  chat: '/api/chat',
  chatHistory: '/api/chat/history',
  
  // Monitoring & Metrics
  metrics: '/api/metrics',
  experiments: '/api/experiments',
  logs: '/api/logs',
  
  // Settings
  settings: '/api/settings',
  
  // Health check
  health: '/api/health',
};

export default api;