// lib/services/api/supabaseOrderService.ts
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Address {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'wallet' | 'upi';
  last4?: string;
  brand?: string;
}

interface OrderData {
  items: OrderItem[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  vatAmount: number;
  total: number;
  appliedCoupon?: {
    id: string;
    code: string;
    discountAmount: number;
  };
}

const supabaseOrderService = {
  async createOrder(userId: string, orderData: OrderData) {
    try {
      const orderNumber = `ORD-${Date.now().toString().substring(6)}`;
      const isCashOnDelivery = orderData.paymentMethod.type === 'cash';
      
      // Create the order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: uuidv4(),
          user_id: userId,
          order_number: orderNumber,
          status: 'pending',
          payment_status: isCashOnDelivery ? 'pending' : 'failed',
          payment_method: orderData.paymentMethod.type,
          payment_id: null,
          subtotal: orderData.subtotal,
          gst_amount: orderData.vatAmount,
          delivery_charge: orderData.deliveryCharge,
          total_amount: orderData.total,
          delivery_address: orderData.deliveryAddress,
          notes: orderData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(orderError.message);
      }

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        id: uuidv4(),
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error(itemsError.message);
      }

      // For cash on delivery, we'll update the status to confirmed immediately
      if (isCashOnDelivery) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'confirmed',
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('Error updating order status:', updateError);
        }
      }

      return { order, paymentRequired: !isCashOnDelivery };
    } catch (error: any) {
      console.error('Supabase order creation error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  },
  
  // Other order-related methods can be added here
};

export default supabaseOrderService;