import { createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/order';

// Fetch user orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId: string, { rejectWithValue }) => {
    try {
      const orders = await orderService.getUserOrders(userId);
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrderDetails(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

// Create order
export interface CreateOrderData {
  userId: string;
  shippingAddressId: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const orderId = await orderService.createOrder(
        orderData.userId,
        orderData.shippingAddressId,
        orderData.paymentMethod,
        orderData.items,
        orderData.totalAmount,
        orderData.deliveryDate,
        orderData.deliveryTimeSlot
      );
      
      const orderDetails = await orderService.getOrderDetails(orderId);
      return orderDetails;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (
    { orderId, status }: { orderId: string; status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' },
    { rejectWithValue }
  ) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      const updatedOrder = await orderService.getOrderDetails(orderId);
      return updatedOrder;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);