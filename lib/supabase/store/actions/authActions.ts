
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService, LoginCredentials, SignUpData, User } from '../../services/auth';

// Login action
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.signIn(credentials);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || JSON.stringify(error) || 'Login failed');
    }
  }
);

// Register action
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: SignUpData, { rejectWithValue }) => {
    try {
      const result = await authService.signUp(userData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Check session action
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await authService.getSession();
      
      if (!session) {
        return null;
      }
      
      const user = await authService.getCurrentUser();
      
      if (!user) {
        return null;
      }
      
      return {
        user,
        token: session.access_token
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check authentication status');
    }
  }
);

// Logout action
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, updates }: { userId: string; updates: Partial<User> }, { rejectWithValue }) => {
    try {
      const updatedUser = await authService.updateProfile(userId, updates);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

// Update password
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (newPassword: string, { rejectWithValue }) => {
    try {
      const result = await authService.updatePassword(newPassword);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password update failed');
    }
  }
);