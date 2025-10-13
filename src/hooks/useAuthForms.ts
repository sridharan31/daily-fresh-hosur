import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Enhanced auth hooks that work with the auth forms
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  token?: string;
}

interface AuthError {
  message: string;
  field?: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Configure axios base URL
const API_BASE_URL = 'http://localhost:3000';
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for auth token
axios.interceptors.request.use(
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

// Enhanced login hook for the auth forms
export const useAuthLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        const response = await axios.post('/api/auth/login', credentials, {
          timeout: 10000, // 10 second timeout
        });
        return response.data;
      } catch (error: any) {
        // Enhanced error handling
        if (error.response) {
          // API responded with error status
          const errorData = error.response.data;
          throw {
            message: errorData.message || 'Login failed',
            field: errorData.field,
            code: errorData.code,
            errors: errorData.errors,
            status: error.response.status,
          };
        } else if (error.request) {
          // Network error
          throw {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
          };
        } else {
          // Other error
          throw {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
          };
        }
      }
    },
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        // Store authentication token
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Update React Query cache
        queryClient.setQueryData(['auth', 'user'], data.user);
        queryClient.setQueryData(['auth', 'status'], { 
          isAuthenticated: true, 
          user: data.user 
        });
        
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Clear any stale auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    },
    retry: (failureCount, error: any) => {
      // Don't retry on authentication or validation errors
      if (error.status && [400, 401, 403, 422].includes(error.status)) {
        return false;
      }
      // Retry up to 2 times for network/server errors
      return failureCount < 2;
    },
  });
};

// Enhanced register hook for the auth forms
export const useAuthRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, RegisterData>({
    mutationFn: async (userData) => {
      try {
        const response = await axios.post('/api/auth/register', userData, {
          timeout: 15000, // 15 second timeout for registration
        });
        return response.data;
      } catch (error: any) {
        // Enhanced error handling
        if (error.response) {
          const errorData = error.response.data;
          throw {
            message: errorData.message || 'Registration failed',
            field: errorData.field,
            code: errorData.code,
            errors: errorData.errors,
            status: error.response.status,
          };
        } else if (error.request) {
          throw {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
          };
        } else {
          throw {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
          };
        }
      }
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // For registration, we might not get a token immediately
        // depending on whether email verification is required
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          
          queryClient.setQueryData(['auth', 'user'], data.user);
          queryClient.setQueryData(['auth', 'status'], { 
            isAuthenticated: true, 
            user: data.user 
          });
        } else {
          // Registration successful but requires verification
          queryClient.setQueryData(['auth', 'status'], { 
            isAuthenticated: false, 
            requiresVerification: true,
            user: data.user 
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
    retry: (failureCount, error: any) => {
      // Don't retry on validation or conflict errors
      if (error.status && [400, 409, 422].includes(error.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Password reset request hook
export const useForgotPassword = () => {
  return useMutation<{ success: boolean; message: string }, AuthError, string>({
    mutationFn: async (email) => {
      try {
        const response = await axios.post('/api/auth/forgot-password', { email });
        return response.data;
      } catch (error: any) {
        if (error.response) {
          throw {
            message: error.response.data.message || 'Failed to send reset email',
            status: error.response.status,
          };
        } else if (error.request) {
          throw {
            message: 'Network error. Please try again.',
            code: 'NETWORK_ERROR',
          };
        } else {
          throw {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
          };
        }
      }
    },
    retry: 2,
  });
};

// Password reset hook
export const useResetPassword = () => {
  return useMutation<{ success: boolean; message: string }, AuthError, { token: string; password: string }>({
    mutationFn: async ({ token, password }) => {
      try {
        const response = await axios.post('/api/auth/reset-password', { token, password });
        return response.data;
      } catch (error: any) {
        if (error.response) {
          throw {
            message: error.response.data.message || 'Failed to reset password',
            status: error.response.status,
          };
        } else if (error.request) {
          throw {
            message: 'Network error. Please try again.',
            code: 'NETWORK_ERROR',
          };
        } else {
          throw {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
          };
        }
      }
    },
    retry: 1,
  });
};

// Logout hook
export const useAuthLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AuthError, void>({
    mutationFn: async () => {
      try {
        const response = await axios.post('/api/auth/logout');
        return response.data;
      } catch (error: any) {
        // Even if logout fails on server, we should clear local data
        return { success: true };
      }
    },
    onSettled: () => {
      // Always clear local auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Reset auth status
      queryClient.setQueryData(['auth', 'status'], { 
        isAuthenticated: false, 
        user: null 
      });
    },
  });
};

// Helper function to get stored user data
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const user = getStoredUser();
  return !!(token && user);
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};