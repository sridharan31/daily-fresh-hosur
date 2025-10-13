 import { ApiResponse } from '../../types/api';
import { LoginCredentials, OTPVerification, RegisterData, User } from '../../types/auth';
import apiClient from './apiClient';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{user: User; token: string}>> {
    return await apiClient.post('/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<ApiResponse<{message: string; token: string}>> {
    return await apiClient.post('/auth/register', userData);
  }

  async verifyOTP(otpData: OTPVerification): Promise<ApiResponse<{user: User; token: string}>> {
    return await apiClient.post('/auth/verify-otp', otpData);
  }

  async forgotPassword(email: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.post('/auth/forgot-password', {email});
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.post('/auth/reset-password', {token, password});
  }

  async refreshToken(): Promise<ApiResponse<{token: string}>> {
    return await apiClient.post('/auth/refresh-token');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return await apiClient.patch('/auth/profile', userData);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.post('/auth/change-password', {currentPassword, newPassword});
  }
}

export default new AuthService();

