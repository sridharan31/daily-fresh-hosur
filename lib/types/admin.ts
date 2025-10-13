import { User } from './auth';
import { DeliverySlot } from './delivery';
import { Order } from './order';
import { Product } from './product';

// Product unit types
export type ProductUnit = 'kg' | 'piece' | 'bundle' | 'liter' | 'bunch' | '500g' | '5kg';

// Admin Dashboard Data
export interface AdminDashboardData {
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  orderStatus: {
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  salesTrend: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    labels: string[];
    data: number[];
  };
  todayStats: {
    orders: number;
    revenue: number;
  };
  activeCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  recentOrders: AdminOrder[];
}

// Admin-specific interfaces extending base types
export interface AdminOrder extends Order {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  assignedDeliverySlot?: DeliverySlot;
  internalNotes?: string;
  lastStatusUpdate: string;
  estimatedDeliveryTime?: string;
  total: number; // For compatibility with revenue calculations
}

export interface AdminProduct extends Product {
  totalSold: number;
  revenue: number;
  lastRestocked: string;
  supplier?: string;
  costPrice: number;
  profitMargin: number;
  views: number;
  conversions: number;
}

export interface AdminCustomer extends User {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
  loyaltyPoints: number;
  registrationSource: string;
  segment: 'new' | 'regular' | 'vip' | 'inactive';
  isActive: boolean;
  name: string; // Computed property for display
}

// Analytics interfaces
export interface AdminAnalytics {
  salesData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
    }>;
  };
  customerData: {
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
    acquisitionRate: number;
  };
  productPerformance: {
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    categories: Array<{
      name: string;
      sales: number;
      percentage: number;
    }>;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    revenueGrowth: number;
    monthlyRevenue: number[];
  };
}

// Admin state
export interface AdminState {
  dashboardData: AdminDashboardData | null;
  orders: AdminOrder[];
  products: AdminProduct[];
  customers: AdminCustomer[];
  deliverySlots: DeliverySlot[];
  analytics: AdminAnalytics | null;
  loading: boolean;
  ordersLoading: boolean;
  productsLoading: boolean;
  customersLoading: boolean;
  deliverySlotsLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
  selectedDateRange: {
    from: string;
    to: string;
  };
  filters: {
    orderStatus: string;
    productCategory: string;
    customerSegment: string;
  };
}

// Filter and search interfaces
export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters extends AdminFilters {
  status?: 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryType?: 'standard' | 'express';
}

export interface ProductFilters extends AdminFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface CustomerFilters extends AdminFilters {
  segment?: 'new' | 'regular' | 'vip' | 'inactive';
  registrationDateFrom?: string;
  registrationDateTo?: string;
  totalSpentMin?: number;
  totalSpentMax?: number;
}

// Update request interfaces
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: string;
  notes?: string;
  estimatedDeliveryTime?: string;
}

export interface UpdateProductStatusRequest {
  productId: string;
  isActive: boolean;
  reason?: string;
}

export interface BulkUpdateRequest<T> {
  items: Array<{
    id: string;
    updates: Partial<T>;
  }>;
}

