import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Environment variables with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || 'https://yvjxgoxrzkcjvuptblri.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database type definitions for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string;
          role: 'customer' | 'admin' | 'delivery';
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          full_name: string;
          role?: 'customer' | 'admin' | 'delivery';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string;
          role?: 'customer' | 'admin' | 'delivery';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name_en: string;
          name_ta: string;
          description_en: string | null;
          description_ta: string | null;
          category_en: string;
          category_ta: string;
          price: number;
          mrp: number | null;
          discount_percentage: number;
          stock_quantity: number;
          unit: string;
          gst_rate: number;
          hsn_code: string | null;
          is_organic: boolean;
          is_featured: boolean;
          is_active: boolean;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ta: string;
          description_en?: string | null;
          description_ta?: string | null;
          category_en: string;
          category_ta: string;
          price: number;
          mrp?: number | null;
          discount_percentage?: number;
          stock_quantity?: number;
          unit?: string;
          gst_rate?: number;
          hsn_code?: string | null;
          is_organic?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ta?: string;
          description_en?: string | null;
          description_ta?: string | null;
          category_en?: string;
          category_ta?: string;
          price?: number;
          mrp?: number | null;
          discount_percentage?: number;
          stock_quantity?: number;
          unit?: string;
          gst_rate?: number;
          hsn_code?: string | null;
          is_organic?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          payment_id: string | null;
          subtotal: number;
          gst_amount: number;
          delivery_charge: number;
          total_amount: number;
          delivery_slot_id: string | null;
          delivery_address: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_id?: string | null;
          subtotal: number;
          gst_amount: number;
          delivery_charge?: number;
          total_amount: number;
          delivery_slot_id?: string | null;
          delivery_address: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_id?: string | null;
          subtotal?: number;
          gst_amount?: number;
          delivery_charge?: number;
          total_amount?: number;
          delivery_slot_id?: string | null;
          delivery_address?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          total?: number;
          created_at?: string;
        };
      };
      delivery_slots: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          capacity: number;
          booked_slots: number;
          is_available: boolean;
          delivery_charge: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          capacity?: number;
          booked_slots?: number;
          is_available?: boolean;
          delivery_charge?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          capacity?: number;
          booked_slots?: number;
          is_available?: boolean;
          delivery_charge?: number;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          pincode: string;
          landmark: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          pincode: string;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}