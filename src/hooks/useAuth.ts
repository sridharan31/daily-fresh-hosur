 import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../lib/supabase/store';
import {
    updatePassword as changePassword,
    loginUser,
    logoutUser as logout,
    registerUser,
    resetPassword,
    updateUserProfile
} from '../../lib/supabase/store/actions/authActions';
import { RootState } from '../../lib/supabase/store/rootReducer';
import { LoginCredentials, OTPVerification, RegisterData, User } from '../../lib/types/auth';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user, token, isAuthenticated, isLoading, error, otpVerificationRequired} = 
    useSelector((state: RootState) => state.auth);

  const login = useCallback(
    (credentials: LoginCredentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const register = useCallback(
    (userData: RegisterData) => dispatch(registerUser(userData)),
    [dispatch]
  );

  const verifyOtp = useCallback(
    (otpData: OTPVerification) => dispatch(verifyOTP(otpData)),
    [dispatch]
  );

  const signOut = useCallback(
    async () => {
      try {
        // Clear persisted storage keys used by auth
        if (typeof window !== 'undefined') {
          try { localStorage.removeItem('auth_token'); } catch {}
          try { localStorage.removeItem('user_data'); } catch {}
        }

        // Purge persisted redux store if persistor exists
        try {
          if (persistor && typeof persistor.purge === 'function') {
            // purge returns a Promise
            await persistor.purge();
          }
        } catch (e) {
          // ignore persistor errors
          console.warn('Persistor purge failed', e);
        }

        // Dispatch logout to reset in-memory state
        dispatch(logout());
      } catch (e) {
        console.warn('Error during signOut', e);
        dispatch(logout());
      }
    },
    [dispatch]
  );

  const resetPasswordAction = useCallback(
    (data: {token: string; email: string; newPassword: string}) => dispatch(resetPassword(data)),
    [dispatch]
  );

  const forgotPasswordAction = useCallback(
    (email: string) => dispatch(forgotPassword(email)),
    [dispatch]
  );

  const updateProfileAction = useCallback(
    (userData: Partial<User>) => dispatch(updateUserProfile(userData)),
    [dispatch]
  );

  const changePasswordAction = useCallback(
    (data: {currentPassword: string; newPassword: string}) => dispatch(changePassword(data)),
    [dispatch]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    loading: isLoading,
    error,
    otpVerificationRequired,
    login,
    register,
    verifyOtp,
    signOut,
    resetPassword: resetPasswordAction,
    forgotPassword: forgotPasswordAction,
    updateProfile: updateProfileAction,
    changePassword: changePasswordAction,
  };
};


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
