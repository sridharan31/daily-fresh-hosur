 import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import userService from '../../services/api/userService';
import { ApiResponse } from '../../types/api';
import { UserPreferences, UserProfile, UserState } from '../../types/user';

// Async thunks
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  void,
  {rejectValue: string}
>(
  'user/fetchUserProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response: ApiResponse<UserProfile> = await userService.getProfile();
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  UserProfile,
  Partial<UserProfile>,
  {rejectValue: string}
>(
  'user/updateUserProfile',
  async (profileData, {rejectWithValue}) => {
    try {
      const response: ApiResponse<UserProfile> = await userService.updateProfile(profileData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const updateUserPreferences = createAsyncThunk<
  UserPreferences,
  Partial<UserPreferences>,
  {rejectValue: string}
>(
  'user/updateUserPreferences',
  async (preferences, {rejectWithValue}) => {
    try {
      const response: ApiResponse<UserPreferences> = await userService.updatePreferences(preferences);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

export const changePassword = createAsyncThunk<
  {message: string},
  {currentPassword: string; newPassword: string},
  {rejectValue: string}
>(
  'user/changePassword',
  async (passwordData, {rejectWithValue}) => {
    try {
      const response = await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const deleteAccount = createAsyncThunk<
  void,
  string,
  {rejectValue: string}
>(
  'user/deleteAccount',
  async (password, {rejectWithValue}) => {
    try {
      await userService.deleteAccount(password);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

// Initial state
const initialState: UserState = {
  profile: null,
  preferences: {
    language: 'en',
    currency: 'AED',
    notifications: {
      orderUpdates: true,
      promotionalOffers: true,
      priceDrops: true,
      stockAlerts: true,
    },
    privacy: {
      shareDataForPersonalization: true,
      receiveMarketingEmails: false,
    },
  },
  loading: false,
  updating: false,
  error: null,
  lastUpdated: null,
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.profile = null;
      state.preferences = initialState.preferences;
      state.error = null;
      state.lastUpdated = null;
    },
    setProfileImage: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.profileImage = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateLocalPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = {...state.preferences, ...action.payload};
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
    markEmailAsVerified: (state) => {
      if (state.profile) {
        state.profile.isEmailVerified = true;
        state.lastUpdated = new Date().toISOString();
      }
    },
    markPhoneAsVerified: (state) => {
      if (state.profile) {
        state.profile.isPhoneVerified = true;
        state.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update profile';
      })
      // Update user preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.updating = false;
        state.preferences = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update preferences';
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updating = false;
        // Password changed successfully
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to change password';
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state) => {
        // Account deleted - will be handled by auth slice
        state.profile = null;
        state.preferences = initialState.preferences;
      });
  },
});

export const {
  clearUserData,
  setProfileImage,
  updateLocalPreferences,
  clearError,
  markEmailAsVerified,
  markPhoneAsVerified,
} = userSlice.actions;

export default userSlice.reducer;
