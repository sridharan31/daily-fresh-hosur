import { supabase } from '../../supabase/client';
import { AdminCustomer } from '../../types/admin';
import { Product, ProductCategory } from '../../types/product';

export interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  regularCustomers: number;
  vipCustomers: number;
  averageOrderValue: number;
}

/**
 * Admin Service - Handles all admin panel operations with Supabase
 */

// ============ INVENTORY MANAGEMENT ============

/**
 * Fetch all products with optional filters
 */
export const fetchInventoryProducts = async (filters?: {
  searchQuery?: string;
  category?: ProductCategory | 'all';
  status?: 'all' | 'low_stock' | 'out_of_stock' | 'active' | 'inactive';
  limit?: number;
  offset?: number;
}): Promise<Product[]> => {
  try {
    let query = supabase.from('products').select('*');

    // Apply filters
    if (filters?.searchQuery) {
      query = query.or(`name_en.ilike.%${filters.searchQuery}%,name_ta.ilike.%${filters.searchQuery}%`);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category_en', filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'low_stock':
          query = query.gt('stock_quantity', 0).lte('stock_quantity', 10);
          break;
        case 'out_of_stock':
          query = query.eq('stock_quantity', 0);
          break;
        case 'active':
          query = query.eq('is_active', true);
          break;
        case 'inactive':
          query = query.eq('is_active', false);
          break;
      }
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

/**
 * Get inventory metrics for dashboard
 */
export const getInventoryMetrics = async (): Promise<InventoryMetrics> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity, price', { count: 'exact' });

    if (error) throw error;

    const products = data || [];
    const totalItems = products.length;
    const lowStockItems = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length;
    const outOfStockItems = products.filter(p => p.stock_quantity === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
    };
  } catch (error) {
    console.error('Error fetching inventory metrics:', error);
    throw error;
  }
};

/**
 * Update product stock quantity
 */
export const updateProductStock = async (
  productId: string,
  newQuantity: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

/**
 * Toggle product active status
 */
export const updateProductStatus = async (
  productId: string,
  isActive: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

/**
 * Export inventory to Excel format (returns data for export)
 */
export const exportInventoryData = async (): Promise<Product[]> => {
  try {
    return await fetchInventoryProducts({ limit: 10000 });
  } catch (error) {
    console.error('Error exporting inventory:', error);
    throw error;
  }
};

// ============ CUSTOMER MANAGEMENT ============

/**
 * Determine customer segment based on order history
 */
const getCustomerSegment = async (userId: string): Promise<'new' | 'regular' | 'vip' | 'inactive'> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // If no orders in last 30 days, customer is inactive or new
    if (!data || data.length === 0) {
      return 'new';
    }

    // Get total orders and spending
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId);

    if (orderError) throw orderError;

    const totalOrders = orderData?.length || 0;
    const totalSpent = orderData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;

    // VIP: 10+ orders or 50000+ spent
    if (totalOrders >= 10 || totalSpent >= 50000) return 'vip';
    // Regular: 3-9 orders
    if (totalOrders >= 3) return 'regular';
    // New: 1-2 orders
    return 'new';
  } catch (error) {
    console.error('Error determining customer segment:', error);
    return 'new';
  }
};

/**
 * Fetch all customers with optional filters
 */
export const fetchCustomers = async (filters?: {
  searchQuery?: string;
  segment?: 'all' | 'new' | 'regular' | 'vip' | 'inactive';
  limit?: number;
  offset?: number;
}): Promise<AdminCustomer[]> => {
  try {
    let query = supabase.from('users').select('*');

    if (filters?.searchQuery) {
      query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,phone.ilike.%${filters.searchQuery}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    // Enrich users with segment and order data
    const customers: AdminCustomer[] = await Promise.all(
      (users || []).map(async (user) => {
        const segment = await getCustomerSegment(user.id);

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('user_id', user.id);

        const totalOrders = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone || '',
          segment,
          totalOrders,
          totalSpent,
          averageOrderValue,
          loyaltyPoints: Math.floor(totalSpent / 10), // 1 point per 10 spent
          isActive: user.role === 'customer',
          registrationSource: 'App',
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        } as AdminCustomer;
      })
    );

    // Apply segment filter if provided
    if (filters?.segment && filters.segment !== 'all') {
      return customers.filter(c => c.segment === filters.segment);
    }

    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer metrics for dashboard
 */
export const getCustomerMetrics = async (): Promise<CustomerMetrics> => {
  try {
    const customers = await fetchCustomers({ limit: 10000 });

    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => c.segment === 'new').length;
    const regularCustomers = customers.filter(c => c.segment === 'regular').length;
    const vipCustomers = customers.filter(c => c.segment === 'vip').length;
    const averageOrderValue = customers.length > 0
      ? customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length
      : 0;

    return {
      totalCustomers,
      newCustomers,
      regularCustomers,
      vipCustomers,
      averageOrderValue,
    };
  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    throw error;
  }
};

/**
 * Update customer status (activate/deactivate)
 */
export const updateCustomerStatus = async (
  userId: string,
  isActive: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: isActive ? 'customer' : 'inactive' })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};

// ============ ADMIN USER MANAGEMENT ============

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'INVENTORY_MANAGER' | 'ORDER_MANAGER' | 'CONTENT_MANAGER' | 'ANALYTICS_VIEWER';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

/**
 * Fetch all admin users from auth.users with custom metadata
 */
export const fetchAdminUsers = async (filters?: {
  searchQuery?: string;
  role?: string;
}): Promise<AdminUser[]> => {
  try {
    // Get all users from the users table with admin role
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    if (filters?.searchQuery) {
      query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.admin_role || 'INVENTORY_MANAGER',
      isActive: user.is_verified,
      lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
      createdAt: new Date(user.created_at),
    })) as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Create a new admin user (requires super admin privilege)
 */
export const createAdminUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: 'SUPER_ADMIN' | 'INVENTORY_MANAGER' | 'ORDER_MANAGER' | 'CONTENT_MANAGER' | 'ANALYTICS_VIEWER';
}): Promise<AdminUser> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    // Add to users table with admin role
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        full_name: userData.name,
        role: 'admin',
        admin_role: userData.role,
        is_verified: false,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      role: data.admin_role || 'INVENTORY_MANAGER',
      isActive: data.is_verified,
      createdAt: new Date(data.created_at),
    } as AdminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Update admin user role and status
 */
export const updateAdminUser = async (
  userId: string,
  updates: {
    name?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<AdminUser> => {
  try {
    const updateData: any = {};
    if (updates.name) updateData.full_name = updates.name;
    if (updates.role) updateData.admin_role = updates.role;
    if (updates.isActive !== undefined) updateData.is_verified = updates.isActive;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      role: data.admin_role || 'INVENTORY_MANAGER',
      isActive: data.is_verified,
      createdAt: new Date(data.created_at),
    } as AdminUser;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

/**
 * Delete admin user (deactivate by setting role)
 */
export const deleteAdminUser = async (userId: string): Promise<void> => {
  try {
    // Soft delete: mark as inactive by changing role
    const { error } = await supabase
      .from('users')
      .update({ role: 'inactive' })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
};

export default {
  // Inventory
  fetchInventoryProducts,
  getInventoryMetrics,
  updateProductStock,
  updateProductStatus,
  exportInventoryData,
  // Customers
  fetchCustomers,
  getCustomerMetrics,
  updateCustomerStatus,
  exportCustomersData: async () => fetchCustomers({ limit: 10000 }),
  // Orders
  exportOrdersData: async () => {
    const orderManagementService = (await import('../../supabase/services/orderManagement')).default;
    return orderManagementService.getAdminOrders({ limit: 10000 });
  },
  // Admin Users
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
