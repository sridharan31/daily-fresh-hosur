import { supabase } from '../supabase';
import cartService from './cartService';
import productService from './productService';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  gst_amount: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  delivery_slot_id?: string;
  delivery_address: any;
  billing_address?: any;
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

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
  gst_rate: number;
  hsn_code?: string;
  created_at: string;
}

export interface CreateOrderData {
  delivery_slot_id: string;
  delivery_address: any;
  billing_address?: any;
  delivery_instructions?: string;
  notes?: string;
  coupon_code?: string;
}

class OrderService {
  // Create order from cart
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      // Validate cart
      const cartValidation = await cartService.validateCart();
      if (!cartValidation.isValid) {
        throw new Error(cartValidation.errors.join(', '));
      }

      // Get cart summary
      const cartSummary = await cartService.getCartSummary();
      
      // Calculate delivery charge
      const deliveryCharge = await cartService.calculateDeliveryCharge(
        orderData.delivery_slot_id,
        cartSummary.subtotal
      );

      // Apply coupon if provided
      let discountAmount = 0;
      if (orderData.coupon_code) {
        discountAmount = await this.applyCoupon(orderData.coupon_code, cartSummary.subtotal);
      }

      const finalSubtotal = cartSummary.subtotal - discountAmount;
      const gstAmount = finalSubtotal * 0.18;
      const cgstAmount = finalSubtotal * 0.09;
      const sgstAmount = finalSubtotal * 0.09;
      const totalAmount = finalSubtotal + gstAmount + deliveryCharge;

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          subtotal: cartSummary.subtotal,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          gst_amount: gstAmount,
          delivery_charge: deliveryCharge,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          delivery_slot_id: orderData.delivery_slot_id,
          delivery_address: orderData.delivery_address,
          billing_address: orderData.billing_address || orderData.delivery_address,
          delivery_instructions: orderData.delivery_instructions,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartSummary.items.map(cartItem => ({
        order_id: order.id,
        product_id: cartItem.product_id,
        product_name: (cartItem as any).products.name_en,
        product_image: (cartItem as any).products.images?.[0],
        quantity: cartItem.quantity,
        price: productService.calculateEffectivePrice((cartItem as any).products),
        total: productService.calculateEffectivePrice((cartItem as any).products) * cartItem.quantity,
        gst_rate: (cartItem as any).products.gst_rate || 18,
        hsn_code: (cartItem as any).products.hsn_code
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const cartItem of cartSummary.items) {
        await productService.updateProductStock(cartItem.product_id, cartItem.quantity);
      }

      // Update delivery slot capacity
      await this.updateDeliverySlotCapacity(orderData.delivery_slot_id, 1);

      // Record coupon usage if applicable
      if (orderData.coupon_code && discountAmount > 0) {
        await this.recordCouponUsage(orderData.coupon_code, order.id, discountAmount);
      }

      // Clear cart
      await cartService.clearCart();

      // Create order status history
      await this.addOrderStatusHistory(order.id, 'pending', 'Order created');

      return order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Generate unique order number
  async generateOrderNumber(): Promise<string> {
    const prefix = 'DF'; // Daily Fresh
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefix}${timestamp}${random}`;
  }

  // Get user orders
  async getUserOrders(limit: number = 20, offset: number = 0): Promise<Order[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_slots (
            date,
            start_time,
            end_time
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_slots (
            date,
            start_time,
            end_time
          ),
          order_items (
            *
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  }

  // Get order items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get order items error:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string, 
    status: Order['status'], 
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to status history
      await this.addOrderStatusHistory(orderId, status, notes);
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['payment_status'],
    paymentId?: string,
    paymentMethod?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentId) updateData.payment_id = paymentId;
      if (paymentMethod) updateData.payment_method = paymentMethod;

      // If payment is successful, update order status to confirmed
      if (paymentStatus === 'paid') {
        updateData.status = 'confirmed';
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Add status history if order was confirmed
      if (paymentStatus === 'paid') {
        await this.addOrderStatusHistory(orderId, 'confirmed', 'Payment received');
      }
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      // Get order details
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error('Order not found');

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled');
      }

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Restore product stock
      const orderItems = await this.getOrderItems(orderId);
      for (const item of orderItems) {
        if (item.product_id) {
          // Add back to stock
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity, sold_count')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({
                stock_quantity: product.stock_quantity + item.quantity,
                sold_count: Math.max(0, product.sold_count - item.quantity)
              })
              .eq('id', item.product_id);

            // Log inventory change
            await productService.logInventoryChange(
              item.product_id,
              'adjustment',
              item.quantity,
              product.stock_quantity,
              product.stock_quantity + item.quantity,
              'Order cancelled',
              orderId
            );
          }
        }
      }

      // Restore delivery slot capacity
      if (order.delivery_slot_id) {
        await this.updateDeliverySlotCapacity(order.delivery_slot_id, -1);
      }

      // Add to status history
      await this.addOrderStatusHistory(orderId, 'cancelled', reason);

      // If payment was made, initiate refund
      if (order.payment_status === 'paid') {
        await this.initiateRefund(orderId, order.total_amount);
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  // Add order status history
  async addOrderStatusHistory(
    orderId: string,
    status: Order['status'],
    notes?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes,
          updated_by: user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Add order status history error:', error);
    }
  }

  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          *,
          users!order_status_history_updated_by_fkey(full_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get order status history error:', error);
      return [];
    }
  }

  // Update delivery slot capacity
  async updateDeliverySlotCapacity(slotId: string, increment: number): Promise<void> {
    try {
      const { data: slot, error: fetchError } = await supabase
        .from('delivery_slots')
        .select('booked_slots, capacity')
        .eq('id', slotId)
        .single();

      if (fetchError) throw fetchError;

      const newBookedSlots = Math.max(0, slot.booked_slots + increment);
      const isAvailable = newBookedSlots < slot.capacity;

      const { error: updateError } = await supabase
        .from('delivery_slots')
        .update({
          booked_slots: newBookedSlots,
          is_available: isAvailable
        })
        .eq('id', slotId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Update delivery slot capacity error:', error);
    }
  }

  // Apply coupon
  async applyCoupon(couponCode: string, orderAmount: number): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      // Get coupon details
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') throw new Error('Invalid coupon code');
        throw error;
      }

      // Check usage limits
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit exceeded');
      }

      // Check user usage limit
      const { count: userUsageCount } = await supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id);

      if (coupon.user_limit && userUsageCount && userUsageCount >= coupon.user_limit) {
        throw new Error('You have already used this coupon');
      }

      // Check minimum order amount
      if (orderAmount < coupon.min_order_amount) {
        throw new Error(`Minimum order amount for this coupon is ₹${coupon.min_order_amount}`);
      }

      // Calculate discount
      let discountAmount = 0;
      
      switch (coupon.discount_type) {
        case 'percentage':
          discountAmount = (orderAmount * coupon.discount_value) / 100;
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
          break;
        case 'fixed':
          discountAmount = coupon.discount_value;
          break;
        case 'free_delivery':
          // This would be handled separately in delivery charge calculation
          discountAmount = 0;
          break;
      }

      return Math.min(discountAmount, orderAmount);
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw error;
    }
  }

  // Record coupon usage
  async recordCouponUsage(
    couponCode: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get coupon ID
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (!coupon) return;

      // Record usage
      await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: coupon.id,
          user_id: user.id,
          order_id: orderId,
          discount_amount: discountAmount
        });

      // Update coupon used count
      await supabase
        .rpc('increment_coupon_usage', { coupon_id: coupon.id });

    } catch (error) {
      console.error('Record coupon usage error:', error);
    }
  }

  // Initiate refund
  async initiateRefund(orderId: string, amount: number): Promise<void> {
    try {
      // Update order with refund information
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          refund_amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add status history
      await this.addOrderStatusHistory(orderId, 'cancelled', `Refund initiated: ₹${amount}`);

      // TODO: Integrate with payment gateway for actual refund
      console.log(`Refund initiated for order ${orderId}: ₹${amount}`);
    } catch (error) {
      console.error('Initiate refund error:', error);
    }
  }

  // Get order statistics for user
  async getUserOrderStats(): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, order) => {
          acc.totalOrders++;
          if (order.status === 'delivered') {
            acc.completedOrders++;
          }
          if (['delivered', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)) {
            acc.totalSpent += order.total_amount;
          }
          return acc;
        },
        { totalOrders: 0, completedOrders: 0, totalSpent: 0 }
      );

      return {
        ...stats,
        averageOrderValue: stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0
      };
    } catch (error) {
      console.error('Get user order stats error:', error);
      return { totalOrders: 0, completedOrders: 0, totalSpent: 0, averageOrderValue: 0 };
    }
  }

  // Reorder (add items from previous order to cart)
  async reorder(orderId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const orderItems = await this.getOrderItems(orderId);

      for (const item of orderItems) {
        if (item.product_id) {
          try {
            await cartService.addToCart(item.product_id, item.quantity);
          } catch (error) {
            // Skip items that are no longer available or out of stock
            console.warn(`Could not add ${item.product_name} to cart:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Reorder error:', error);
      throw error;
    }
  }
}

export default new OrderService();