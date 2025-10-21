export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          category_id: string;
          category_en: string;
          category_ta: string;
          price: number;
          mrp: number | null;
          discount_percentage: number;
          stock_quantity: number;
          min_order_quantity: number;
          max_order_quantity: number;
          unit: string;
          weight: number | null;
          gst_rate: number;
          hsn_code: string | null;
          fssai_license: string | null;
          is_organic: boolean;
          is_featured: boolean;
          is_seasonal: boolean;
          is_active: boolean;
          images: string[];
          nutritional_info: Json | null;
          storage_instructions: string | null;
          origin_state: string;
          expiry_days: number | null;
          tags: string[];
          rating: number;
          review_count: number;
          sold_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ta: string;
          description_en?: string | null;
          description_ta?: string | null;
          category_id: string;
          category_en: string;
          category_ta: string;
          price: number;
          mrp?: number | null;
          discount_percentage?: number;
          stock_quantity?: number;
          min_order_quantity?: number;
          max_order_quantity?: number;
          unit?: string;
          weight?: number | null;
          gst_rate?: number;
          hsn_code?: string | null;
          fssai_license?: string | null;
          is_organic?: boolean;
          is_featured?: boolean;
          is_seasonal?: boolean;
          is_active?: boolean;
          images?: string[];
          nutritional_info?: Json | null;
          storage_instructions?: string | null;
          origin_state?: string;
          expiry_days?: number | null;
          tags?: string[];
          rating?: number;
          review_count?: number;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ta?: string;
          description_en?: string | null;
          description_ta?: string | null;
          category_id?: string;
          category_en?: string;
          category_ta?: string;
          price?: number;
          mrp?: number | null;
          discount_percentage?: number;
          stock_quantity?: number;
          min_order_quantity?: number;
          max_order_quantity?: number;
          unit?: string;
          weight?: number | null;
          gst_rate?: number;
          hsn_code?: string | null;
          fssai_license?: string | null;
          is_organic?: boolean;
          is_featured?: boolean;
          is_seasonal?: boolean;
          is_active?: boolean;
          images?: string[];
          nutritional_info?: Json | null;
          storage_instructions?: string | null;
          origin_state?: string;
          expiry_days?: number | null;
          tags?: string[];
          rating?: number;
          review_count?: number;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name_en: string;
          name_ta: string;
          description_en: string | null;
          description_ta: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ta: string;
          description_en?: string | null;
          description_ta?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ta?: string;
          description_en?: string | null;
          description_ta?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount: number;
          shipping_address_id: string;
          payment_method: 'cash' | 'card' | 'upi' | 'wallet';
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_date: string | null;
          delivery_time_slot: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount: number;
          shipping_address_id: string;
          payment_method: 'cash' | 'card' | 'upi' | 'wallet';
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_date?: string | null;
          delivery_time_slot?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount?: number;
          shipping_address_id?: string;
          payment_method?: 'cash' | 'card' | 'upi' | 'wallet';
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_date?: string | null;
          delivery_time_slot?: string | null;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: 'home' | 'work' | 'other';
          name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          phone: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'home' | 'work' | 'other';
          name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          phone: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'home' | 'work' | 'other';
          name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          phone?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          description: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          code: string;
          start_date: string;
          end_date: string;
          min_purchase: number | null;
          max_discount: number | null;
          usage_limit: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          code: string;
          start_date: string;
          end_date: string;
          min_purchase?: number | null;
          max_discount?: number | null;
          usage_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          code?: string;
          start_date?: string;
          end_date?: string;
          min_purchase?: number | null;
          max_discount?: number | null;
          usage_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}