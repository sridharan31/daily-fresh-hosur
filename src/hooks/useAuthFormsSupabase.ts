import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../../lib/services/authService';

// Enhanced auth hooks that work with Supabase authentication
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

// Enhanced login hook for the auth forms using Supabase
export const useAuthLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        const result = await authService.signIn({
          email: credentials.email,
          password: credentials.password
        });
        
        const profile = result.profile || null;
        const authUser = result.user;
        
        return {
          success: true,
          message: 'Login successful',
          user: {
            id: authUser.id,
            email: authUser.email || '',
            firstName: profile?.full_name?.split(' ')[0] || authUser.user_metadata?.full_name?.split(' ')[0] || '',
            lastName: profile?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            phone: profile?.phone || authUser.user_metadata?.phone || '',
          }
        };
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Enhanced error handling for Supabase errors
        let errorMessage = 'Login failed';
        let errorCode = 'UNKNOWN_ERROR';
        
        if (error.message) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
            errorCode = 'INVALID_CREDENTIALS';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and confirm your account';
            errorCode = 'EMAIL_NOT_CONFIRMED';
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please try again later';
            errorCode = 'TOO_MANY_REQUESTS';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw {
          message: errorMessage,
          code: errorCode,
        };
      }
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    }
  });
};

// Enhanced register hook for the auth forms using Supabase
export const useAuthRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, RegisterData>({
    mutationFn: async (userData) => {
      try {
        const fullName = `${userData.firstName} ${userData.lastName}`.trim();
        
        const result = await authService.signUp({
          email: userData.email,
          password: userData.password,
          fullName: fullName,
          phone: userData.phone,
          preferredLanguage: 'en' // Default to English, can be changed later
        });
        
        return {
          success: true,
          message: 'Registration successful! Please check your email to verify your account.',
          user: {
            id: result.user?.id || '',
            email: result.user?.email || '',
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
          }
        };
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Enhanced error handling for Supabase errors
        let errorMessage = 'Registration failed';
        let errorCode = 'UNKNOWN_ERROR';
        let errorField = undefined;
        
        if (error.message) {
          if (error.message.includes('User already registered')) {
            errorMessage = 'An account with this email already exists';
            errorCode = 'EMAIL_EXISTS';
            errorField = 'email';
          } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'Password must be at least 6 characters long';
            errorCode = 'WEAK_PASSWORD';
            errorField = 'password';
          } else if (error.message.includes('Unable to validate email address')) {
            errorMessage = 'Please enter a valid email address';
            errorCode = 'INVALID_EMAIL';
            errorField = 'email';
          } else if (error.message.includes('Signup is disabled')) {
            errorMessage = 'New registrations are currently disabled';
            errorCode = 'SIGNUP_DISABLED';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw {
          message: errorMessage,
          code: errorCode,
          field: errorField,
        };
      }
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
    onError: (error) => {
      console.error('Registration mutation error:', error);
    }
  });
};

// Forgot password hook using Supabase
export const useAuthForgotPassword = () => {
  return useMutation<AuthResponse, AuthError, { email: string }>({
    mutationFn: async ({ email }) => {
      try {
        await authService.resetPassword(email);
        
        return {
          success: true,
          message: 'Password reset email sent! Please check your inbox.',
        };
      } catch (error: any) {
        console.error('Forgot password error:', error);
        
        let errorMessage = 'Failed to send reset email';
        let errorCode = 'UNKNOWN_ERROR';
        
        if (error.message) {
          if (error.message.includes('Unable to validate email address')) {
            errorMessage = 'Please enter a valid email address';
            errorCode = 'INVALID_EMAIL';
          } else if (error.message.includes('Email not found')) {
            errorMessage = 'No account found with this email address';
            errorCode = 'EMAIL_NOT_FOUND';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw {
          message: errorMessage,
          code: errorCode,
        };
      }
    },
    onError: (error) => {
      console.error('Forgot password mutation error:', error);
    }
  });
};

// Reset password hook using Supabase
export const useAuthResetPassword = () => {
  return useMutation<AuthResponse, AuthError, { token: string; password: string }>({
    mutationFn: async ({ password }) => {
      try {
        // Note: With Supabase, the actual password reset is handled via URL params
        // This would typically be called from a password reset page
        const user = await authService.getCurrentUser();
        if (!user) {
          throw new Error('No active session for password reset');
        }
        
        // Update password for current session
        await authService.updatePassword(password);
        
        return {
          success: true,
          message: 'Password updated successfully!',
        };
      } catch (error: any) {
        console.error('Reset password error:', error);
        
        let errorMessage = 'Failed to reset password';
        let errorCode = 'UNKNOWN_ERROR';
        
        if (error.message) {
          if (error.message.includes('Password should be at least')) {
            errorMessage = 'Password must be at least 6 characters long';
            errorCode = 'WEAK_PASSWORD';
          } else if (error.message.includes('No active session')) {
            errorMessage = 'Reset link has expired. Please request a new one';
            errorCode = 'SESSION_EXPIRED';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw {
          message: errorMessage,
          code: errorCode,
        };
      }
    },
    onError: (error) => {
      console.error('Reset password mutation error:', error);
    }
  });
};

// Logout hook using Supabase
export const useAuthLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError>({
    mutationFn: async () => {
      try {
        await authService.signOut();
        
        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (error: any) {
        console.error('Logout error:', error);
        
        // Even if logout fails, we should clear local state
        return {
          success: true,
          message: 'Logged out successfully',
        };
      }
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout mutation error:', error);
      // Still clear cache even on error
      queryClient.clear();
    }
  });
};

// Hook to check current authentication status
export const useAuthStatus = () => {
  return useMutation<{ isAuthenticated: boolean; user: any }, AuthError>({
    mutationFn: async () => {
      try {
        const user = await authService.getCurrentUser();
        
        return {
          isAuthenticated: user !== null,
          user: user,
        };
      } catch (error: any) {
        console.error('Auth status error:', error);
        
        return {
          isAuthenticated: false,
          user: null,
        };
      }
    }
  });
};

// Hook to get user profile
export const useUserProfile = () => {
  return useMutation<any, AuthError>({
    mutationFn: async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || !currentUser.user) {
          throw new Error('No authenticated user found');
        }
        const profile = await authService.getUserProfile(currentUser.user.id);
        return profile;
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        throw {
          message: error.message || 'Failed to fetch user profile',
          code: 'PROFILE_FETCH_ERROR',
        };
      }
    }
  });
};

export default {
  useAuthLogin,
  useAuthRegister,
  useAuthForgotPassword,
  useAuthResetPassword,
  useAuthLogout,
  useAuthStatus,
  useUserProfile,
};