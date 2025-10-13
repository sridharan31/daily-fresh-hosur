import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/api/authService';
import { ApiResponse } from '../../types/api';
import { AuthState, LoginCredentials, OTPVerification, RegisterData, User } from '../../types/auth';

// Async thunks
export const loginUser = createAsyncThunk<
  {user: User; token: string},
  LoginCredentials,
  {rejectValue: string}
>(
  'auth/login',
  async (credentials, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{user: User; token: string}> = await authService.login(credentials);
      console.log('🔐 Raw login response:', response);
      // Extract the actual data from the response
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<
  {message: string; token: string},
  RegisterData,
  {rejectValue: string}
>(
  'auth/register',
  async (userData, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{message: string; token: string}> = await authService.register(userData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOTP = createAsyncThunk<
  {user: User; token: string},
  OTPVerification,
  {rejectValue: string}
>(
  'auth/verifyOTP',
  async (otpData, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{user: User; token: string}> = await authService.verifyOTP(otpData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const resetPassword = createAsyncThunk<
  {message: string},
  {token: string; email: string; newPassword: string},
  {rejectValue: string}
>(
  'auth/resetPassword',
  async ({token, newPassword}, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{message: string}> = await authService.resetPassword(token, newPassword);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<
  {message: string},
  string,
  {rejectValue: string}
>(
  'auth/forgotPassword',
  async (email, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{message: string}> = await authService.forgotPassword(email);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset request failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  {rejectValue: string}
>(
  'auth/updateUserProfile',
  async (userData, {rejectWithValue}) => {
    try {
      const response: ApiResponse<User> = await authService.updateProfile(userData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const changePassword = createAsyncThunk<
  {message: string},
  {currentPassword: string; newPassword: string},
  {rejectValue: string}
>(
  'auth/changePassword',
  async ({currentPassword, newPassword}, {rejectWithValue}) => {
    try {
      const response: ApiResponse<{message: string}> = await authService.changePassword(currentPassword, newPassword);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpVerificationRequired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🔐 Login successful, updating auth state:', action.payload);
        console.log('🔐 User data received:', action.payload.user);
        console.log('🔐 User role:', action.payload.user?.role);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('🔐 Auth state updated:', { 
          isAuthenticated: state.isAuthenticated, 
          userRole: state.user?.role,
          userEmail: state.user?.email 
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.otpVerificationRequired = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      // OTP Verification
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpVerificationRequired = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed';
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset request failed';
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Profile update failed';
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password change failed';
      });
  },
});

export const {logout, clearError, updateProfile} = authSlice.actions;
export default authSlice.reducer;

