 // app/services/api/apiClient.ts (Updated imports)
// Platform-safe AsyncStorage import
let AsyncStorage: any;

if (typeof window !== 'undefined') {
  // Web environment - use localStorage wrapper
  AsyncStorage = {
    getItem: async (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors on web
      }
    },
    removeItem: async (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors on web
      }
    },
  };
} else {
  // Native environment
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    // Fallback if import fails
    AsyncStorage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
}

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import Config from '../../../src/config/environment';
import { ApiError, ApiResponse } from '../../types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          // Redirect to login screen
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    };

    if (error.response) {
      apiError.statusCode = error.response.status;
      apiError.message = (error.response.data as any)?.message || error.message;
      apiError.code = (error.response.data as any)?.code || 'API_ERROR';
    } else if (error.request) {
      apiError.message = 'Network error. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    }

    return apiError;
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.client.get(url, {params});
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
  return this.client.post(url, data, config);
}

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.client.patch(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.client.put(url, data);
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.client.delete(url);
  }
}

export default new ApiClient();
