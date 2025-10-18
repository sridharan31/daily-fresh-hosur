// lib/store/actions/supabaseAuthActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { checkActiveSession, directSupabaseLogin } from '../../services/supabaseAuth';
import { LoginCredentials, User } from '../../types/auth';

// Direct Supabase login thunk action
export const supabaseLoginUser = createAsyncThunk<
  {user: User; token: string},
  LoginCredentials,
  {rejectValue: string}
>(
  'auth/supabaseLogin',
  async (credentials, {rejectWithValue}) => {
    try {
      console.log('Attempting Supabase login with credentials');
      const result = await directSupabaseLogin(credentials);
      
      // Return properly formatted user data for our redux store
      return {
        user: result.user,
        token: result.token
      };
    } catch (error: any) {
      console.error('Supabase login error in thunk:', error);
      return rejectWithValue(error.message || 'Supabase login failed');
    }
  }
);

// Check for an existing Supabase session
export const checkSupabaseSession = createAsyncThunk<
  {user: User; token: string} | null,
  void,
  {rejectValue: string}
>(
  'auth/checkSession',
  async (_, {rejectWithValue}) => {
    try {
      console.log('Checking for existing Supabase session');
      const session = await checkActiveSession();
      
      if (!session) {
        console.log('No active session found');
        return null;
      }
      
      // Get user data from session
      const { user } = session;
      
      if (!user) {
        console.log('Session exists but no user data found');
        return null;
      }
      
      // Map Supabase user to our app User type
      const userData: User = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        role: user.user_metadata?.role || 'customer',
        is_verified: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };
      
      return {
        user: userData,
        token: session.access_token
      };
    } catch (error: any) {
      console.error('Error checking session:', error);
      return rejectWithValue(error.message || 'Failed to check authentication status');
    }
  }
);