import { Order as DatabaseOrder, OrderItem as DatabaseOrderItem, Product } from '../../types/database';
import { supabase } from '../client';
import { safeRPC, safeUpdate } from '../utils/databaseUtils';

export type Order = DatabaseOrder;
export type OrderItem = DatabaseOrderItem & {
  product: Product;
};

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Order service for Supabase
export const orderService = {
  // Get user orders
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  },

  // Get order details with items
  async getOrderDetails(orderId: string): Promise<OrderWithItems | null> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) return null;

      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id, 
          order_id, 
          product_id, 
          quantity, 
          price, 
          created_at,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: (items || []) as unknown as OrderItem[]
      };
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  },

  // Create new order
  async createOrder(
    userId: string,
    shippingAddressId: string,
    paymentMethod: 'cash' | 'card' | 'upi' | 'wallet',
    items: Array<{ productId: string; quantity: number; price: number }>,
    totalAmount: number,
    deliveryDate?: string,
    deliveryTimeSlot?: string
  ): Promise<string> {
    try {
      // Prepare order items for the stored procedure
      const orderItemsForRPC = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      // Start a Supabase transaction by using RPC function with order items included
      const { data: order, error: orderError } = await safeRPC(supabase, 'create_order', {
        p_user_id: userId,
        p_shipping_address_id: shippingAddressId,
        p_payment_method: paymentMethod,
        p_total_amount: totalAmount,
        p_delivery_date: deliveryDate || null,
        p_delivery_time_slot: deliveryTimeSlot || null,
        p_order_items: orderItemsForRPC
      });

      if (orderError) throw orderError;
      if (!order || !order.id) throw new Error('Failed to create order');

      const orderId = order.id;
      
      // No need to manually insert order items anymore as they're handled in the stored procedure

      return orderId;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(
    orderId: string, 
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<void> {
    try {
      const query = supabase.from('orders').eq('id', orderId);
      const { error } = await safeUpdate(query, { status });

      if (error) throw error;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  // Update order payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<void> {
    try {
      const query = supabase.from('orders').eq('id', orderId);
      const { error } = await safeUpdate(query, { payment_status: paymentStatus });

      if (error) throw error;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }
};