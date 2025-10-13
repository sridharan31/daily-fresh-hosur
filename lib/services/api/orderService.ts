 // app/services/api/orderService.ts
import { API_ENDPOINTS } from '../../../src/config/apiConfig';
import { ApiResponse, Pagination } from '../../types/api';
import { Address } from '../../types/auth';
import { DeliverySlot } from '../../types/delivery';
import { Order, OrderStatus } from '../../types/order';
import apiClient from './apiClient';

interface CreateOrderRequest {
  deliveryAddress: Address;
  deliverySlot: DeliverySlot;
  paymentMethodId: string;
  deliveryInstructions?: string;
  contactlessDelivery?: boolean;
  couponCode?: string;
}

interface OrderFilters {
  status?: OrderStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

interface OrderTrackingInfo {
  order: Order;
  timeline: Array<{
    status: OrderStatus;
    timestamp: string;
    message: string;
    location?: string;
  }>;
  deliveryPerson?: {
    name: string;
    phone: string;
    photo?: string;
    location?: {latitude: number; longitude: number};
  };
  estimatedDeliveryTime?: string;
}

interface CancelOrderRequest {
  reason: string;
  refundMethod?: 'original' | 'wallet';
}

class OrderService {
  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<{order: Order; paymentClientSecret?: string}>> {
    return await apiClient.post<{order: Order; paymentClientSecret?: string}>(API_ENDPOINTS.CREATE_ORDER, orderData);
  }

  // Get order history with filters
  async getOrderHistory(filters: OrderFilters = {}): Promise<ApiResponse<{orders: Order[]; pagination: Pagination}>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const url = `${API_ENDPOINTS.ORDER_HISTORY}?${queryParams.toString()}`;
    return await apiClient.get<{orders: Order[]; pagination: Pagination}>(url);
  }

  // Get single order details
  async getOrderDetails(orderId: string): Promise<ApiResponse<Order>> {
    return await apiClient.get<Order>(API_ENDPOINTS.ORDER_DETAILS(orderId));
  }

  // Track order
  async trackOrder(orderId: string): Promise<ApiResponse<OrderTrackingInfo>> {
    return await apiClient.get<OrderTrackingInfo>(API_ENDPOINTS.TRACK_ORDER(orderId));
  }

  // Cancel order
  async cancelOrder(orderId: string, cancelData: CancelOrderRequest): Promise<ApiResponse<{order: Order; refundAmount: number}>> {
    return await apiClient.post<{order: Order; refundAmount: number}>(API_ENDPOINTS.CANCEL_ORDER(orderId), cancelData);
  }

  // Reorder (add previous order items to cart)
  async reorder(orderId: string): Promise<ApiResponse<{cartItemsAdded: number; unavailableItems: string[]}>> {
    return await apiClient.post<{cartItemsAdded: number; unavailableItems: string[]}>(API_ENDPOINTS.REORDER(orderId));
  }

  // Rate order
  async rateOrder(orderId: string, rating: {
    overallRating: number;
    deliveryRating: number;
    comment?: string;
    productRatings?: Array<{productId: string; rating: number; comment?: string}>;
  }): Promise<ApiResponse<{message: string}>> {
    return await apiClient.post<{message: string}>(`${API_ENDPOINTS.ORDER_DETAILS(orderId)}/rate`, rating);
  }

  // Report order issue
  async reportOrderIssue(orderId: string, issue: {
    type: 'missing_items' | 'damaged_items' | 'wrong_items' | 'delivery_issue' | 'other';
    description: string;
    affectedItems?: string[];
    images?: string[];
    preferredResolution?: 'refund' | 'replacement' | 'store_credit';
  }): Promise<ApiResponse<{ticketId: string; estimatedResolutionTime: string}>> {
    return await apiClient.post<{ticketId: string; estimatedResolutionTime: string}>(
      `${API_ENDPOINTS.ORDER_DETAILS(orderId)}/report-issue`, 
      issue
    );
  }

  // Get order invoice
  async getOrderInvoice(orderId: string, format: 'pdf' | 'html' = 'pdf'): Promise<ApiResponse<{downloadUrl: string}>> {
    return await apiClient.get<{downloadUrl: string}>(`${API_ENDPOINTS.ORDER_DETAILS(orderId)}/invoice?format=${format}`);
  }

  // Update delivery instructions
  async updateDeliveryInstructions(orderId: string, instructions: string): Promise<ApiResponse<Order>> {
    return await apiClient.patch<Order>(`${API_ENDPOINTS.ORDER_DETAILS(orderId)}/delivery-instructions`, {instructions});
  }

  // Request order modification (if allowed)
  async requestOrderModification(orderId: string, modifications: {
    addItems?: Array<{productId: string; quantity: number}>;
    removeItems?: string[];
    updateQuantities?: Array<{itemId: string; quantity: number}>;
    newDeliverySlot?: DeliverySlot;
    newDeliveryAddress?: Address;
  }): Promise<ApiResponse<{canModify: boolean; modifiedOrder?: Order; additionalCharge?: number}>> {
    return await apiClient.post<{canModify: boolean; modifiedOrder?: Order; additionalCharge?: number}>(
      `${API_ENDPOINTS.ORDER_DETAILS(orderId)}/modify`, 
      modifications
    );
  }

  // Get order statistics
  async getOrderStatistics(): Promise<ApiResponse<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategories: Array<{category: string; orderCount: number}>;
    monthlySpending: Array<{month: string; amount: number}>;
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ORDERS}/statistics`);
  }

  // Get delivery time estimates
  async getDeliveryEstimates(addressId: string): Promise<ApiResponse<{
    standardDelivery: {minTime: string; maxTime: string; charge: number};
    expressDelivery: {minTime: string; maxTime: string; charge: number};
    nextAvailableSlot: {date: string; time: string; type: string};
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ORDERS}/delivery-estimates?addressId=${addressId}`);
  }

  // Check order modification eligibility
  async checkModificationEligibility(orderId: string): Promise<ApiResponse<{
    canModify: boolean;
    canCancel: boolean;
    timeLeft: string;
    restrictions: string[];
  }>> {
    return await apiClient.get(`${API_ENDPOINTS.ORDER_DETAILS(orderId)}/modification-eligibility`);
  }
}

export default new OrderService();
