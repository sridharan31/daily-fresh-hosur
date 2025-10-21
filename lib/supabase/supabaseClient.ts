import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Initialize Supabase client
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
                    'https://yvjxgoxrzkcjvuptblri.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;