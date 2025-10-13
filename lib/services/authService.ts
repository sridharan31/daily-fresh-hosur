import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: 'customer' | 'admin' | 'delivery' | 'vendor';
  is_verified: boolean;
  avatar_url?: string;
  preferred_language: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  preferredLanguage?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface PhoneAuthData {
  phone: string;
  otp?: string;
}

class AuthService {
  // Sign up with email and password
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            preferred_language: data.preferredLanguage || 'en',
            role: 'customer'
          }
        }
      });

      if (authError) throw authError;

      // Insert user data into our users table
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            phone: data.phone || null,
            full_name: data.fullName,
            role: 'customer',
            preferred_language: data.preferredLanguage || 'en',
            is_verified: false
          });

        if (userError) {
          console.error('Error inserting user data:', userError);
        }
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;

      // Get user profile data
      if (authData.user) {
        const userData = await this.getUserProfile(authData.user.id);
        return { user: authData.user, session: authData.session, profile: userData };
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign in with phone OTP (for Tamil Nadu users)
  async signInWithPhone(phone: string) {
    try {
      // Format phone number for Indian mobile numbers
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Phone OTP error:', error);
      throw error;
    }
  }

  // Verify OTP for phone authentication
  async verifyOTP(phone: string, otp: string) {
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      // Check if user exists in our users table, if not create
      if (data.user) {
        const existingUser = await this.getUserProfile(data.user.id);
        
        if (!existingUser) {
          // Create user profile for phone-only registration
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              phone: formattedPhone,
              full_name: data.user.user_metadata?.full_name || 'User',
              role: 'customer',
              preferred_language: 'ta', // Default to Tamil for phone users
              is_verified: true
            });

          if (userError) {
            console.error('Error creating user profile:', userError);
          }
        }
      }

      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        const profile = await this.getUserProfile(user.id);
        return { user, profile };
      }
      
      return { user: null, profile: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, profile: null };
    }
  }

  // Get user profile from our users table
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Clear any stored user data
      await AsyncStorage.multiRemove([
        'user_profile',
        'user_preferences',
        'cart_items'
      ]);

    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.dailyfresh.hosur://reset-password'
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const { profile } = await this.getCurrentUser();
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  }

  // Resend email verification
  async resendEmailVerification() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Resend email verification error:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      // Delete user data (RLS policies will handle cascade)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Sign out
      await this.signOut();

    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Get user addresses
  async getUserAddresses() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get user addresses error:', error);
      throw error;
    }
  }

  // Add user address
  async addAddress(address: {
    title: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      // If this is default address, unset other defaults
      if (address.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          ...address,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  }

  // Update user address
  async updateAddress(addressId: string, updates: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  // Delete user address
  async deleteAddress(addressId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }
}

export default new AuthService();