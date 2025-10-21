import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'customer' | 'admin' | 'delivery';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  preferences?: {
    language: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// Map Supabase user data to our application's User type
const mapSupabaseUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || null,
    role: user.user_metadata?.role || 'customer',
    is_verified: user.email_confirmed_at ? true : false,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    preferences: {
      language: user.user_metadata?.preferred_language || 'en',
    }
  };
};

// Authentication service using Supabase
export const authService = {
  // Sign in user with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.user || !data.session) {
        throw new Error('Authentication failed');
      }
      
      const user = mapSupabaseUser(data.user);
      
      return {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      };
    } catch (error: any) {
      throw error;
    }
  },
  
  // Sign up a new user
  async signUp(signUpData: SignUpData): Promise<{ message: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.full_name,
            phone: signUpData.phone,
            role: 'customer',
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.user) {
        throw new Error('Registration failed');
      }
      
      return { message: 'Registration successful! Please check your email for verification.' };
    } catch (error: any) {
      throw error;
    }
  },
  
  // Sign out current user
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw error;
    }
  },
  
  // Reset password
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { message: 'Password reset instructions sent to your email' };
    } catch (error: any) {
      throw error;
    }
  },
  
  // Update password with reset token
  async updatePassword(newPassword: string): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { message: 'Password updated successfully' };
    } catch (error: any) {
      throw error;
    }
  },
  
  // Check if user session exists
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.session;
    } catch (error: any) {
      throw error;
    }
  },
  
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return null;
      }
      
      return mapSupabaseUser(data.user);
    } catch (error) {
      return null;
    }
  },
  
  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Update auth metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          phone: updates.phone,
          preferred_language: updates.preferences?.language,
        }
      });
      
      if (authUpdateError) {
        throw new Error(authUpdateError.message);
      }
      
      // Get updated user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Failed to retrieve updated user data');
      }
      
      return mapSupabaseUser(userData.user);
    } catch (error: any) {
      throw error;
    }
  }
};