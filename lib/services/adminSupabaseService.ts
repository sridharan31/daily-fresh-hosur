// lib/services/adminSupabaseService.ts
import { supabase } from '../supabase';
import { AdminDashboardData, AdminOrder, AdminCustomer, AdminAnalytics } from '../types/admin';

export class AdminSupabaseService {
  // Dashboard Data
  async getDashboardData(period: string = 'today'): Promise<AdminDashboardData> {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default: // today
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      // Fetch orders for the period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level');

      if (productsError) throw productsError;

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, created_at, last_sign_in_at')
        .gte('created_at', startDate.toISOString());

      if (usersError) throw usersError;

      // Calculate statistics
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const processingOrders = orders?.filter(order => order.status === 'processing').length || 0;
      const deliveredOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const cancelledOrders = orders?.filter(order => order.status === 'cancelled').length || 0;
      
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const activeUsers = users?.filter(user => user.last_sign_in_at && 
        new Date(user.last_sign_in_at) >= startDate).length || 0;
      
      const lowStockItems = products?.filter(product => 
        (product.stock_quantity || 0) <= (product.min_stock_level || 5)).length || 0;

      // Generate mock chart data (in a real app, this would come from analytics)
      const chartLabels = period === 'month' 
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : period === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['6AM', '10AM', '2PM', '6PM', '10PM'];

      const salesData = chartLabels.map(() => Math.floor(Math.random() * 10000) + 5000);
      const topProductsData = ['Vegetables', 'Fruits', 'Dairy', 'Grains'].map(() => 
        Math.floor(Math.random() * 100) + 20);

      return {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          todayOrders: totalOrders,
        },
        revenue: {
          total: totalRevenue,
          today: totalRevenue,
        },
        users: {
          active: activeUsers,
          total: users?.length || 0,
        },
        products: {
          total: products?.length || 0,
          lowStock: lowStockItems,
        },
        orderStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        salesTrend: {
          labels: chartLabels,
          data: salesData,
        },
        topProducts: {
          labels: ['Vegetables', 'Fruits', 'Dairy', 'Grains'],
          data: topProductsData,
        },
        todayStats: {
          orders: totalOrders,
          revenue: totalRevenue,
        },
        activeCustomers: activeUsers,
        lowStockItems,
        pendingOrders,
        recentOrders: orders?.slice(0, 5) || [],
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Orders
  async getOrders(filters: any = {}): Promise<{ orders: AdminOrder[]; pagination: any }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:users(id, first_name, last_name, email),
          order_items(*)
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data: orders, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (error) throw error;

      const adminOrders: AdminOrder[] = orders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number || `#${order.id.slice(0, 8)}`,
        customerId: order.user_id,
        customerName: order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown',
        customerEmail: order.user?.email || '',
        status: order.status,
        totalAmount: order.total_amount,
        itemCount: order.order_items?.length || 0,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        deliveryDate: order.delivery_date,
        deliverySlot: order.delivery_slot,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        notes: order.notes,
        items: order.order_items || [],
      })) || [];

      return {
        orders: adminOrders,
        pagination: {
          page: 1,
          limit: filters.limit || 20,
          total: adminOrders.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Customers
  async getCustomers(filters: any = {}): Promise<{ customers: AdminCustomer[]; pagination: any }> {
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          orders(id, total_amount, status)
        `);

      if (filters.searchTerm) {
        query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      const { data: users, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (error) throw error;

      const adminCustomers: AdminCustomer[] = users?.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        phone: user.phone,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        totalOrders: user.orders?.length || 0,
        totalSpent: user.orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0,
        averageOrderValue: user.orders?.length ? 
          (user.orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) / user.orders.length) : 0,
        loyaltyPoints: 0,
        registrationSource: 'web',
        segment: user.orders?.length > 5 ? 'loyal' : user.orders?.length > 0 ? 'regular' : 'new',
        isActive: user.last_sign_in_at && 
          new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })) || [];

      return {
        customers: adminCustomers,
        pagination: {
          page: 1,
          limit: filters.limit || 20,
          total: adminCustomers.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Products
  async getProducts(filters: any = {}): Promise<{ products: any[]; pagination: any }> {
    try {
      let query = supabase
        .from('products')
        .select('*');

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('is_active', filters.status === 'active');
      }

      const { data: products, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (error) throw error;

      return {
        products: products || [],
        pagination: {
          page: 1,
          limit: filters.limit || 20,
          total: products?.length || 0,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(params: { dateRange: { from: string; to: string }; type: string }): Promise<AdminAnalytics> {
    try {
      // This would be replaced with real analytics queries
      return {
        totalRevenue: 125000,
        totalOrders: 450,
        averageOrderValue: 278,
        conversionRate: 3.2,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        customerGrowth: 15.2,
        revenueByPeriod: [
          { period: '2024-01', revenue: 45000 },
          { period: '2024-02', revenue: 52000 },
          { period: '2024-03', revenue: 48000 },
          { period: '2024-04', revenue: 55000 },
        ],
        topCategories: [
          { category: 'Vegetables', revenue: 35000, percentage: 28 },
          { category: 'Fruits', revenue: 28000, percentage: 22.4 },
          { category: 'Dairy', revenue: 22000, percentage: 17.6 },
          { category: 'Grains', revenue: 18000, percentage: 14.4 },
        ],
        customerSegments: [
          { segment: 'New', count: 120, percentage: 35 },
          { segment: 'Regular', count: 150, percentage: 44 },
          { segment: 'VIP', count: 72, percentage: 21 },
        ],
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
}

export const adminSupabaseService = new AdminSupabaseService();