import axios from 'axios';
import { APP } from '../../core/config/app.config';

export const api = axios.create({
  baseURL: APP.API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  // attach token if you have one in storage
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (!error.response) {
      console.error('Network error', error);
    }
    return Promise.reject(error);
  }
);
