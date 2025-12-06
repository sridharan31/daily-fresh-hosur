// lib/supabase/services/orderManagement.ts
// Comprehensive Order Management Service for Supabase

import { supabase } from '../client';

// Types
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  // Legacy/Alternative fields support
  address_line1?: string;
  postal_code?: string;
  name?: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
  gst_rate: number;
  hsn_code?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_id?: string;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  gst_amount: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  delivery_slot_instance_id?: string;
  delivery_address: OrderAddress;
  billing_address?: OrderAddress;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  delivery_instructions?: string;
  notes?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  invoice_number?: string;
  invoice_url?: string;
  tracking_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  delivery_slot?: {
    slot_date: string;
    start_ts: string;
    end_ts: string;
    slot_type: string;
  };
  status_history?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes?: string;
  updated_by?: string;
  created_at: string;
}

export interface CreateOrderInput {
  user_id: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    gst_rate?: number;
    hsn_code?: string;
  }>;
  delivery_address: OrderAddress;
  billing_address?: OrderAddress;
  payment_method: string;
  delivery_slot_instance_id?: string;
  delivery_instructions?: string;
  coupon_code?: string;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  payment_status?: PaymentStatus | 'all';
  date_from?: string;
  date_to?: string;
  search?: string;
  delivery_date?: string;
  urgent_only?: boolean;
  limit?: number;
  offset?: number;
}

// Order Management Service
export const orderManagementService = {
  // ============ Customer Order Operations ============

  // Get customer's orders
  async getCustomerOrders(userId: string, filters: OrderFilters = {}): Promise<OrderWithDetails[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name_en, name_ta, images)
          ),
          delivery_slot:delivery_slot_instances(slot_date, start_ts, end_ts, slot_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as OrderWithDetails[];
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw error;
    }
  },

  // Get single order details for customer
  async getOrderDetails(orderId: string, userId?: string): Promise<OrderWithDetails | null> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:users(id, full_name, email, phone),
          delivery_slot:delivery_slot_instances(slot_date, start_ts, end_ts, slot_type),
          status_history:order_status_history(*)
        `)
        .eq('id', orderId)
        .single();

      // If userId provided, ensure order belongs to user
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data as OrderWithDetails;
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  },

  // Create a new order
  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const gstRate = 0.18; // 18% GST
      const cgst = subtotal * 0.09;
      const sgst = subtotal * 0.09;
      const gstAmount = subtotal * gstRate;
      const deliveryCharge = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
      const totalAmount = subtotal + gstAmount + deliveryCharge;

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: input.user_id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          payment_method: input.payment_method,
          subtotal,
          cgst_amount: cgst,
          sgst_amount: sgst,
          gst_amount: gstAmount,
          delivery_charge: deliveryCharge,
          discount_amount: 0,
          total_amount: totalAmount,
          delivery_slot_instance_id: input.delivery_slot_instance_id,
          delivery_address: input.delivery_address,
          billing_address: input.billing_address || input.delivery_address,
          delivery_instructions: input.delivery_instructions,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = input.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        gst_rate: item.gst_rate || 18,
        hsn_code: item.hsn_code,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update delivery slot booked count
      if (input.delivery_slot_instance_id) {
        await supabase.rpc('increment_slot_booking', {
          slot_instance_id: input.delivery_slot_instance_id
        });
      }

      // Create initial status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'pending',
          notes: 'Order placed successfully',
        });

      return order as Order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Cancel order (customer)
  async cancelOrder(orderId: string, userId: string, reason: string): Promise<Order> {
    try {
      // Verify order belongs to user and is cancellable
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (!order) throw new Error('Order not found');

      // Only allow cancellation for pending or confirmed orders
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      // Update order status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'cancelled',
          notes: `Cancelled by customer: ${reason}`,
        });

      // Release delivery slot
      if (order.delivery_slot_instance_id) {
        await supabase.rpc('decrement_slot_booking', {
          slot_instance_id: order.delivery_slot_instance_id
        });
      }

      return updatedOrder as Order;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  // ============ Admin Order Operations ============

  // Get all orders (admin)
  async getAdminOrders(filters: OrderFilters = {}): Promise<OrderWithDetails[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name_en, name_ta, images, unit)
          ),
          customer:users(id, full_name, email, phone),
          delivery_slot:delivery_slot_instances(slot_date, start_ts, end_ts, slot_type)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer.full_name.ilike.%${filters.search}%`);
      }

      if (filters.delivery_date) {
        query = query.eq('delivery_slot.slot_date', filters.delivery_date);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as OrderWithDetails[];
    } catch (error) {
      console.error('Get admin orders error:', error);
      throw error;
    }
  },

  // Update order status (admin)
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUserId: string,
    notes?: string
  ): Promise<Order> {
    try {
      // Validate status transition
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['out_for_delivery', 'cancelled'],
        out_for_delivery: ['delivered', 'cancelled'],
        delivered: ['refunded'],
        cancelled: ['refunded'],
        refunded: [],
      };

      if (!validTransitions[order.status as OrderStatus]?.includes(newStatus)) {
        throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
      }

      // Update order
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'delivered') {
        updateData.actual_delivery_time = new Date().toISOString();
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          notes: notes || `Status updated to ${newStatus}`,
          updated_by: adminUserId,
        });

      return updatedOrder as Order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  // Get order statistics (admin dashboard)
  async getOrderStatistics(period: 'today' | 'week' | 'month' = 'today'): Promise<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }> {
    try {
      let dateFilter: string;
      const now = new Date();

      switch (period) {
        case 'today':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = monthAgo.toISOString().split('T')[0];
          break;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .gte('created_at', dateFilter);

      if (error) throw error;

      const orders = data || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const processingOrders = orders.filter(o => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

      return {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        avgOrderValue,
      };
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  },

  // Get urgent orders (delivery within 2 hours)
  async getUrgentOrders(): Promise<OrderWithDetails[]> {
    try {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:users(id, full_name, email, phone),
          delivery_slot:delivery_slot_instances(slot_date, start_ts, end_ts, slot_type)
        `)
        .in('status', ['pending', 'confirmed', 'preparing'])
        .lte('delivery_slot.start_ts', twoHoursFromNow)
        .order('delivery_slot.start_ts', { ascending: true });

      if (error) throw error;
      return (data || []) as OrderWithDetails[];
    } catch (error) {
      console.error('Get urgent orders error:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentId?: string
  ): Promise<Order> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  },

  // Process refund
  async processRefund(orderId: string, refundAmount: number, adminUserId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          refund_amount: refundAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'refunded',
          notes: `Refund processed: ₹${refundAmount}`,
          updated_by: adminUserId,
        });

      return data as Order;
    } catch (error) {
      console.error('Process refund error:', error);
      throw error;
    }
  },

  // Subscribe to order updates (real-time)
  subscribeToOrders(
    callback: (payload: any) => void,
    filters?: { status?: OrderStatus }
  ) {
    let channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(filters?.status && { filter: `status=eq.${filters.status}` }),
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export default orderManagementService;
