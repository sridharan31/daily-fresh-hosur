// app/hooks/useUser.ts
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import {
    changePassword,
    clearError,
    clearUserData,
    deleteAccount,
    fetchUserProfile,
    markEmailAsVerified,
    markPhoneAsVerified,
    setProfileImage,
    updateLocalPreferences,
    updateUserPreferences,
    updateUserProfile,
} from '../../lib/store/slices/userSlice';
import { UserPreferences, UserProfile } from '../../lib/types/user';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);

  const actions = {
    // Async actions
    fetchProfile: () => dispatch(fetchUserProfile()),
    updateProfile: (profileData: Partial<UserProfile>) => 
      dispatch(updateUserProfile(profileData)),
    updatePreferences: (preferences: Partial<UserPreferences>) => 
      dispatch(updateUserPreferences(preferences)),
    changeUserPassword: (currentPassword: string, newPassword: string) => 
      dispatch(changePassword({ currentPassword, newPassword })),
    deleteUserAccount: (password: string) => 
      dispatch(deleteAccount(password)),

    // Synchronous actions
    clearData: () => dispatch(clearUserData()),
    setImage: (imageUrl: string) => dispatch(setProfileImage(imageUrl)),
    updateLocalPrefs: (preferences: Partial<UserPreferences>) => 
      dispatch(updateLocalPreferences(preferences)),
    clearErrorMessage: () => dispatch(clearError()),
    markEmailVerified: () => dispatch(markEmailAsVerified()),
    markPhoneVerified: () => dispatch(markPhoneAsVerified()),
  };

  return {
    // State
    profile: userState.profile,
    preferences: userState.preferences,
    loading: userState.loading,
    updating: userState.updating,
    error: userState.error,
    lastUpdated: userState.lastUpdated,

    // Computed values
    isProfileComplete: !!(
      userState.profile?.firstName &&
      userState.profile?.lastName &&
      userState.profile?.email &&
      userState.profile?.phoneNumber
    ),
    isEmailVerified: userState.profile?.isEmailVerified || false,
    isPhoneVerified: userState.profile?.isPhoneVerified || false,
    fullName: userState.profile ? 
      `${userState.profile.firstName} ${userState.profile.lastName}`.trim() : '',

    // Actions
    ...actions,
  };
};

export default useUser;
