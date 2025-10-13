// app/services/api/userService.ts
import { ApiResponse } from '../../types/api';
import {
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AddAddressRequest,
  UpdateAddressRequest,
  DeleteAccountRequest,
  UserAddress,
  UserStats,
  UserActivity,
  UserWishlist,
  UserReview,
  UserNotification,
  UserSearchFilters,
  UserListResponse,
} from '../../types/user';
import apiClient from './apiClient';

class UserService {
  // Profile management
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.get<UserProfile>('/user/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put<UserProfile>('/user/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async uploadProfileImage(imageUri: string): Promise<ApiResponse<{imageUrl: string}>> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiClient.post<{imageUrl: string}>('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteProfileImage(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>('/user/profile/image');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Preferences management
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.get<UserPreferences>('/user/preferences');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.put<UserPreferences>('/user/preferences', preferences);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Password management
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{message: string}>> {
    try {
      const requestData: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };
      const response = await apiClient.post<{message: string}>('/user/change-password', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/reset-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/confirm-password-reset', {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Address management
  async getAddresses(): Promise<ApiResponse<UserAddress[]>> {
    try {
      const response = await apiClient.get<UserAddress[]>('/user/addresses');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addAddress(addressData: AddAddressRequest): Promise<ApiResponse<UserAddress>> {
    try {
      const response = await apiClient.post<UserAddress>('/user/addresses', addressData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateAddress(addressData: UpdateAddressRequest): Promise<ApiResponse<UserAddress>> {
    try {
      const { id, ...updateData } = addressData;
      const response = await apiClient.put<UserAddress>(`/user/addresses/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/user/addresses/${addressId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async setDefaultAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(`/user/addresses/${addressId}/set-default`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Account management
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    try {
      const requestData: DeleteAccountRequest = { password };
      const response = await apiClient.post<void>('/user/delete-account', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deactivateAccount(): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/deactivate');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async reactivateAccount(): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/reactivate');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Email and phone verification
  async sendEmailVerification(): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/verify-email/send');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/verify-email/confirm', { token });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendPhoneVerification(phoneNumber: string): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/verify-phone/send', { phoneNumber });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyPhone(phoneNumber: string, code: string): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await apiClient.post<{message: string}>('/user/verify-phone/confirm', {
        phoneNumber,
        code,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // User statistics and activity
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await apiClient.get<UserStats>('/user/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserActivity(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    activities: UserActivity[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>> {
    try {
      const response = await apiClient.get(`/user/activity?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Wishlist management
  async getWishlist(): Promise<ApiResponse<UserWishlist[]>> {
    try {
      const response = await apiClient.get<UserWishlist[]>('/user/wishlist');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addToWishlist(productId: string): Promise<ApiResponse<UserWishlist>> {
    try {
      const response = await apiClient.post<UserWishlist>('/user/wishlist', { productId });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/user/wishlist/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async clearWishlist(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>('/user/wishlist');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reviews management
  async getUserReviews(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    reviews: UserReview[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>> {
    try {
      const response = await apiClient.get(`/user/reviews?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addReview(
    productId: string,
    orderId: string,
    rating: number,
    title?: string,
    comment?: string,
    isRecommended?: boolean
  ): Promise<ApiResponse<UserReview>> {
    try {
      const reviewData = {
        productId,
        orderId,
        rating,
        title,
        comment,
        isRecommended,
      };
      const response = await apiClient.post<UserReview>('/user/reviews', reviewData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateReview(
    reviewId: string,
    rating?: number,
    title?: string,
    comment?: string,
    isRecommended?: boolean
  ): Promise<ApiResponse<UserReview>> {
    try {
      const updateData = {
        rating,
        title,
        comment,
        isRecommended,
      };
      const response = await apiClient.put<UserReview>(`/user/reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/user/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Notifications management
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    notifications: UserNotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>> {
    try {
      const response = await apiClient.get(`/user/notifications?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(`/user/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/user/notifications/read-all');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/user/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async clearAllNotifications(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>('/user/notifications');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Admin functions (if user has admin privileges)
  async searchUsers(filters: UserSearchFilters, page: number = 1, limit: number = 20): Promise<ApiResponse<UserListResponse>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
        ),
      });
      
      const response = await apiClient.get<UserListResponse>(`/admin/users?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async blockUser(userId: string, reason?: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(`/admin/users/${userId}/block`, { reason });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async unblockUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(`/admin/users/${userId}/unblock`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Data export
  async exportUserData(): Promise<ApiResponse<{downloadUrl: string}>> {
    try {
      const response = await apiClient.post<{downloadUrl: string}>('/user/export-data');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Privacy and GDPR compliance
  async getDataUsageConsent(): Promise<ApiResponse<{
    consents: Array<{
      type: string;
      granted: boolean;
      grantedAt?: string;
      revokedAt?: string;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/user/data-usage-consent');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateDataUsageConsent(consents: Array<{
    type: string;
    granted: boolean;
  }>): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/user/data-usage-consent', { consents });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
