import { LoginCredentials, User } from '../../lib/types/auth';
import { supabase } from '../supabase';

// Direct Supabase authentication handler for checkout flow
export const directSupabaseLogin = async (credentials: LoginCredentials) => {
  try {
    console.log('Attempting direct Supabase login for:', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      console.error('Supabase login error:', error.message);
      throw new Error(error.message);
    }
    
    if (!data || !data.user || !data.session) {
      console.error('Supabase login returned empty data');
      throw new Error('Authentication failed');
    }
    
    console.log('Supabase login successful, processing user data');
    
    // Map Supabase user data to our app's User type
    const userData: User = {
      id: data.user.id,
      email: data.user.email || '',
      fullName: data.user.user_metadata?.full_name || '',
      phone: data.user.user_metadata?.phone || '',
      role: data.user.user_metadata?.role || 'customer',
      isVerified: data.user.email_confirmed_at ? true : false,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
      preferences: {
        language: data.user.user_metadata?.preferred_language || 'en',
      }
    };
    
    return {
      user: userData,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
    };
  } catch (error: any) {
    console.error('Direct Supabase login failed:', error);
    throw error;
  }
};

// Utility to check if there's an active Supabase session
export const checkActiveSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error);
      return null;
    }
    
    if (!data || !data.session) {
      console.log('No active session found');
      return null;
    }
    
    console.log('Active session found');
    return data.session;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
};