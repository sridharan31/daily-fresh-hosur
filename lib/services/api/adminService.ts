 // app/services/api/adminService.ts
import { API_ENDPOINTS } from '../../../src/config/apiConfig';
import { ApiResponse, Pagination } from '../../types/api';
import { User } from '../../types/auth';
import { DeliverySlot } from '../../types/delivery';
import { Order, OrderStatus } from '../../types/order';
import { Product, ProductCategory } from '../../types/product';
import apiClient from './apiClient';

interface DashboardData {
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
}

interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AdminService {
  // Dashboard
  async getDashboardData(period: string = 'today'): Promise<ApiResponse<DashboardData>> {
    return await apiClient.get<DashboardData>(`${API_ENDPOINTS.ADMIN_DASHBOARD}?period=${period}`);
  }

  // Product Management
  async getProducts(filters: AdminFilters = {}): Promise<ApiResponse<{products: Product[]; pagination: Pagination}>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_ENDPOINTS.ADMIN_PRODUCTS}?${queryParams.toString()}`;
    return await apiClient.get<{products: Product[]; pagination: Pagination}>(url);
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    return await apiClient.post<Product>(API_ENDPOINTS.ADMIN_PRODUCTS, product);
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiClient.patch<Product>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${productId}`, updates);
  }

  async deleteProduct(productId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${productId}`);
  }

  async updateProductStock(productId: string, stock: number): Promise<ApiResponse<Product>> {
    return await apiClient.patch<Product>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${productId}/stock`, {stock});
  }

  async bulkUpdateProducts(updates: Array<{id: string; updates: Partial<Product>}>): Promise<ApiResponse<{updated: number; failed: Array<{id: string; error: string}>}>> {
    return await apiClient.post<{updated: number; failed: Array<{id: string; error: string}>}>(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/bulk-update`, 
      {updates}
    );
  }

async importProducts(file: FormData): Promise<ApiResponse<{imported: number; failed: number; errors: string[]}>> {
  return await apiClient.post<{imported: number; failed: number; errors: string[]}>(
    `${API_ENDPOINTS.ADMIN_PRODUCTS}/import`, 
    file,
    {'Content-Type': 'multipart/form-data'} // This might not be the correct format
  );
}

  async exportProducts(format: 'csv' | 'excel' = 'excel'): Promise<ApiResponse<{downloadUrl: string}>> {
    return await apiClient.get<{downloadUrl: string}>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/export?format=${format}`);
  }

  // Category Management
  async getCategories(): Promise<ApiResponse<ProductCategory[]>> {
    return await apiClient.get<ProductCategory[]>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/categories`);
  }

  async addCategory(category: Omit<ProductCategory, 'id'>): Promise<ApiResponse<ProductCategory>> {
    return await apiClient.post<ProductCategory>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/categories`, category);
  }

  async updateCategory(categoryId: string, updates: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> {
    return await apiClient.patch<ProductCategory>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/categories/${categoryId}`, updates);
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/categories/${categoryId}`);
  }

  // Order Management
  async getOrders(filters: AdminFilters = {}): Promise<ApiResponse<{orders: Order[]; pagination: Pagination}>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_ENDPOINTS.ADMIN_ORDERS}?${queryParams.toString()}`;
    return await apiClient.get<{orders: Order[]; pagination: Pagination}>(url);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<ApiResponse<Order>> {
    return await apiClient.patch<Order>(`${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/status`, {status, notes});
  }

  async assignDeliverySlot(orderId: string, slotId: string): Promise<ApiResponse<Order>> {
    return await apiClient.patch<Order>(`${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/delivery-slot`, {slotId});
  }

  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<{order: Order; refundAmount: number}>> {
    return await apiClient.post<{order: Order; refundAmount: number}>(`${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/cancel`, {reason});
  }

  async processRefund(orderId: string, amount?: number, reason?: string): Promise<ApiResponse<{refundId: string; amount: number}>> {
    return await apiClient.post<{refundId: string; amount: number}>(`${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/refund`, {amount, reason});
  }

  // Customer Management
  async getCustomers(filters: AdminFilters = {}): Promise<ApiResponse<{customers: User[]; pagination: Pagination}>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_ENDPOINTS.ADMIN_CUSTOMERS}?${queryParams.toString()}`;
    return await apiClient.get<{customers: User[]; pagination: Pagination}>(url);
  }

  async updateCustomerStatus(customerId: string, status: 'active' | 'suspended' | 'banned'): Promise<ApiResponse<User>> {
    return await apiClient.patch<User>(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/${customerId}/status`, {status});
  }

  async sendNotificationToCustomer(customerId: string, notification: {
    title: string;
    body: string;
    type: string;
    data?: any;
  }): Promise<ApiResponse<{messageId: string}>> {
    return await apiClient.post<{messageId: string}>(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/${customerId}/notify`, notification);
  }

  async getCustomerAnalytics(): Promise<ApiResponse<{
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    topCustomers: Array<{id: string; name: string; totalSpent: number; orderCount: number}>;
    customerSegments: Array<{segment: string; count: number; percentage: number}>;
    retentionRate: number;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/analytics`);
  }

  // Inventory Management
  async getInventory(filters: AdminFilters = {}): Promise<ApiResponse<{
    products: Array<Product & {stockValue: number; lastUpdated: string}>;
    pagination: Pagination;
  }>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_ENDPOINTS.ADMIN_INVENTORY}?${queryParams.toString()}`;
    return await apiClient.get(url);
  }

  async updateStockLevels(updates: Array<{productId: string; stock: number; notes?: string}>): Promise<ApiResponse<{updated: number; failed: number}>> {
    return await apiClient.post<{updated: number; failed: number}>(`${API_ENDPOINTS.ADMIN_INVENTORY}/update-stock`, {updates});
  }

  async generateStockReport(): Promise<ApiResponse<{
    totalProducts: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    topSellingProducts: Array<{id: string; name: string; unitsSold: number}>;
    slowMovingProducts: Array<{id: string; name: string; daysSinceLastSale: number}>;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_INVENTORY}/report`);
  }

  // Delivery Slot Management
  async getDeliverySlots(): Promise<ApiResponse<DeliverySlot[]>> {
    return await apiClient.get<DeliverySlot[]>(`${API_ENDPOINTS.ADMIN_DASHBOARD}/delivery-slots`);
  }

  async createDeliverySlot(slot: Omit<DeliverySlot, 'id' | 'bookedCount'>): Promise<ApiResponse<DeliverySlot>> {
    return await apiClient.post<DeliverySlot>(`${API_ENDPOINTS.ADMIN_DASHBOARD}/delivery-slots`, slot);
  }

  async updateDeliverySlot(slotId: string, updates: Partial<DeliverySlot>): Promise<ApiResponse<DeliverySlot>> {
    return await apiClient.patch<DeliverySlot>(`${API_ENDPOINTS.ADMIN_DASHBOARD}/delivery-slots/${slotId}`, updates);
  }

  async deleteDeliverySlot(slotId: string): Promise<ApiResponse<{message: string}>> {
    return await apiClient.delete<{message: string}>(`${API_ENDPOINTS.ADMIN_DASHBOARD}/delivery-slots/${slotId}`);
  }

  async getSlotUtilization(date: string): Promise<ApiResponse<{
    date: string;
    slots: Array<{
      id: string;
      time: string;
      type: string;
      capacity: number;
      booked: number;
      utilizationPercentage: number;
    }>;
    totalCapacity: number;
    totalBooked: number;
    overallUtilization: number;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_DASHBOARD}/delivery-slots/utilization?date=${date}`);
  }

  // Analytics & Reports
  async generateSalesReport(startDate: string, endDate: string): Promise<ApiResponse<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: Array<{id: string; name: string; quantity: number; revenue: number}>;
    salesByCategory: Array<{category: string; amount: number; percentage: number}>;
    dailySales: Array<{date: string; sales: number; orders: number}>;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_ANALYTICS}/sales?startDate=${startDate}&endDate=${endDate}`);
  }

  async getProductAnalytics(): Promise<ApiResponse<{
    totalProducts: number;
    activeProducts: number;
    topPerformingProducts: Array<{id: string; name: string; views: number; sales: number; revenue: number}>;
    categoryPerformance: Array<{category: string; products: number; sales: number}>;
    stockTurnover: Array<{id: string; name: string; turnoverRate: number}>;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_ANALYTICS}/products`);
  }

  async getDeliveryAnalytics(): Promise<ApiResponse<{
    totalDeliveries: number;
    onTimeDeliveryRate: number;
    averageDeliveryTime: number;
    slotUtilization: Array<{type: string; averageUtilization: number}>;
    deliveryIssues: Array<{type: string; count: number}>;
    customerSatisfaction: number;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_ANALYTICS}/delivery`);
  }

  // Data Export
  async exportData(type: 'orders' | 'customers' | 'products', format: 'csv' | 'excel' = 'excel'): Promise<ApiResponse<{downloadUrl: string}>> {
    return await apiClient.get<{downloadUrl: string}>(`${API_ENDPOINTS.ADMIN_ANALYTICS}/export/${type}?format=${format}`);
  }

  // Bulk Operations
  async bulkDeleteProducts(productIds: string[]): Promise<ApiResponse<{deleted: number; failed: Array<{id: string; error: string}>}>> {
    return await apiClient.post<{deleted: number; failed: Array<{id: string; error: string}>}>(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/bulk-delete`, 
      {productIds}
    );
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<ApiResponse<{updated: number; failed: Array<{id: string; error: string}>}>> {
    return await apiClient.post<{updated: number; failed: Array<{id: string; error: string}>}>(
      `${API_ENDPOINTS.ADMIN_ORDERS}/bulk-update-status`, 
      {orderIds, status}
    );
  }

  // System Settings
  async getSystemSettings(): Promise<ApiResponse<{
    deliveryCharges: {standard: number; express: number};
    freeDeliveryThreshold: number;
    vatRate: number;
    businessHours: Array<{day: string; open: string; close: string}>;
    maxOrderValue: number;
    minOrderValue: number;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_DASHBOARD}/settings`);
  }

  async updateSystemSettings(settings: any): Promise<ApiResponse<{message: string}>> {
    return await apiClient.patch<{message: string}>(`${API_ENDPOINTS.ADMIN_DASHBOARD}/settings`, settings);
  }

  // Analytics
  async getAnalytics(params: {
    dateRange: {from: string; to: string}; 
    type: 'sales' | 'customers' | 'products'
  }): Promise<ApiResponse<{
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
  }>> {
    const queryParams = new URLSearchParams();
    queryParams.append('from', params.dateRange.from);
    queryParams.append('to', params.dateRange.to);
    queryParams.append('type', params.type);
    
    return await apiClient.get(`${API_ENDPOINTS.ADMIN_DASHBOARD}/analytics?${queryParams.toString()}`);
  }

  // Product Status Update
  async updateProductStatus(productId: string, isActive: boolean): Promise<ApiResponse<Product>> {
    return await apiClient.patch<Product>(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${productId}/status`, { isActive });
  }
}

export default new AdminService();
