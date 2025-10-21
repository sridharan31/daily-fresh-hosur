// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          category_id: string;
          inventory_count: number;
          unit: string;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          image: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
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
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'shipped';
          total_amount: number;
          shipping_address_id: string;
          payment_method: 'card' | 'cash' | 'wallet' | 'upi';
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_date: string | null;
          delivery_time_slot: string | null;
          created_at: string;
          updated_at: string;
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
          updated_at: string;
        };
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          address_type: 'home' | 'work' | 'other';
          full_name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          phone: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

// Export type helpers for table rows
export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type UserAddress = Database['public']['Tables']['user_addresses']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];