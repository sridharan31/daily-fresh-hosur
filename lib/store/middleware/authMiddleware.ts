 import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
// import { NavigationService } from '../../../app/navigation/navigationUtils';
import Config from '../../../src/config/environment';
import locationService from '../../services/location/locationService';
import pushNotificationService from '../../services/push/pushNotificationService';
import {
  loginUser,
  logout,
  registerUser,
  updateProfile,
  verifyOTP,
} from '../slices/authSlice';
import { clearCart } from '../slices/cartSlice';
import { clearCurrentOrder } from '../slices/orderSlice';
import { clearUserData } from '../slices/userSlice';

// Create auth middleware
export const authMiddleware = createListenerMiddleware();

// Start auth listener
authMiddleware.startListening({
  matcher: isAnyOf(loginUser.fulfilled, verifyOTP.fulfilled),
  effect: async (action, listenerApi) => {
    const payload = action.payload as any;
    // The async thunk returns {user, token} directly
    const {user, token} = payload || {};
    
    console.log('🔧 AuthMiddleware received payload:', payload);
    console.log('🔧 Extracted user:', user);
    console.log('🔧 Extracted token:', token ? 'Present' : 'Missing');
    
    if (!user || !token) {
      console.error('Invalid auth payload received');
      return;
    }
    
    try {
      // Store auth token
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      // Set user ID for analytics and crashlytics
      if (Config.ENABLE_ANALYTICS) {
        await analytics().setUserId(user.id);
        await analytics().setUserProperties({
          user_type: user.role,
          email_verified: user.isEmailVerified.toString(),
          phone_verified: user.isPhoneVerified.toString(),
          registration_date: user.createdAt,
          preferred_language: user.preferredLanguage || 'en',
        });
        
        // Log login event
        await analytics().logLogin({
          method: action.type.includes('login') ? 'email' : 'otp',
        });
      }
      
      if (Config.ENABLE_CRASHLYTICS) {
        await crashlytics().setUserId(user.id);
        await crashlytics().setAttributes({
          role: user.role,
          email: user.email,
        });
      }
      
      // Send FCM token to server for push notifications
      try {
        await pushNotificationService.getFCMToken();
      } catch (error) {
        console.warn('Failed to register FCM token:', error);
      }
      
      // Handle pending deep links after authentication
      try {
        const {default: deepLinkingService} = await import('../../services/push/deepLinking');
        if (deepLinkingService && (deepLinkingService as any).handlePendingLink) {
          await (deepLinkingService as any).handlePendingLink();
        }
      } catch (error) {
        console.warn('Failed to handle pending deep link:', error);
      }
      
      // Navigate based on user role
      console.log('🧭 Navigation: User role is', user.role);
      if (user.role === 'admin') {
        console.log('🧭 Should navigate to admin dashboard');
        // NavigationService.navigateToAdmin();
      } else {
        console.log('🧭 Should navigate to main app');
        // NavigationService.navigateToMain();
      }
      
      console.log('User authenticated successfully:', user.email);
    } catch (error) {
      console.error('Error in auth success handler:', error);
      
      if (Config.ENABLE_CRASHLYTICS) {
        crashlytics().recordError(error as Error);
      }
    }
  },
});

// Handle auth errors
authMiddleware.startListening({
  matcher: isAnyOf(loginUser.rejected, registerUser.rejected, verifyOTP.rejected),
  effect: async (action, listenerApi) => {
    const errorPayload = action.payload as any;
    const errorMessage = action.error as any;
    const error = errorPayload?.message || errorMessage?.message || 'Authentication failed';
    
    console.error('Authentication error:', error);
    
    // Log auth error to analytics
    if (Config.ENABLE_ANALYTICS) {
      await analytics().logEvent('auth_error', {
        error_type: action.type,
        error_message: error,
      });
    }
    
    // Don't log sensitive auth errors to crashlytics
    if (Config.ENABLE_CRASHLYTICS && !error.includes('password') && !error.includes('credentials')) {
      crashlytics().log(`Auth error: ${action.type} - ${error}`);
    }
  },
});

// Handle logout
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as any;
      const user = state?.auth?.user;
      
      // Clear stored auth data
      await AsyncStorage.multiRemove([
        'auth_token',
        'user_data',
        'fcm_token',
        'pending_deep_link',
      ]);
      
      // Clear user-related data from other slices
      listenerApi.dispatch(clearUserData());
      listenerApi.dispatch(clearCart());
      listenerApi.dispatch(clearCurrentOrder());
      
      // Clear analytics user data
      if (Config.ENABLE_ANALYTICS) {
        await analytics().resetAnalyticsData();
        await analytics().logEvent('logout', {
          user_id: user?.id,
          session_duration: user ? Date.now() - new Date(user.createdAt || 0).getTime() : 0,
        });
      }
      
      if (Config.ENABLE_CRASHLYTICS) {
        await crashlytics().setUserId('');
        await crashlytics().setAttributes({});
      }
      
      // Stop location tracking - with fallback
      try {
        if (locationService && (locationService as any).stopLocationTracking) {
          (locationService as any).stopLocationTracking();
        }
      } catch (error) {
        console.warn('Failed to stop location tracking:', error);
      }
      
      // Clear notification handlers - with fallback
      try {
        if (pushNotificationService && (pushNotificationService as any).cleanup) {
          (pushNotificationService as any).cleanup();
        }
      } catch (error) {
        console.warn('Failed to cleanup push notifications:', error);
      }
      
      // Navigate to auth flow
      // Navigate to auth screen
      console.log('🧭 Should navigate to auth screen');
      // NavigationService.navigateToAuth();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
});

// Handle profile updates
authMiddleware.startListening({
  actionCreator: updateProfile,
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as any;
      const user = state?.auth?.user;
      
      if (user) {
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        // Update analytics user properties
        if (Config.ENABLE_ANALYTICS) {
          await analytics().setUserProperties({
            email_verified: user.isEmailVerified?.toString() || 'false',
            phone_verified: user.isPhoneVerified?.toString() || 'false',
            preferred_language: (user as any).preferredLanguage || 'en',
          });
        }
        
        console.log('User profile updated:', action.payload);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },
});

// Handle registration success
authMiddleware.startListening({
  actionCreator: registerUser.fulfilled,
  effect: async (action, listenerApi) => {
    try {
      // Log registration event
      if (Config.ENABLE_ANALYTICS) {
        await analytics().logSignUp({
          method: 'email',
        });
      }
      
      console.log('User registration successful');
    } catch (error) {
      console.error('Error in registration handler:', error);
    }
  },
});

// Token refresh handler
authMiddleware.startListening({
  predicate: (action) => {
    // Listen for 401 responses that indicate token expiration
    const payload = action.payload as any;
    return action.type.endsWith('/rejected') && 
           payload?.statusCode === 401;
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as any;
    
    if (state?.auth?.isAuthenticated) {
      console.log('Token expired, logging out user');
      listenerApi.dispatch(logout());
    }
  },
});
