// @ts-ignore
import RazorpayCheckout from 'react-native-razorpay';
import { supabase } from '../supabase';
import orderService from './orderService';

export interface PaymentOptions {
  orderId: string;
  amount: number; // in rupees
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay configuration for Tamil Nadu market
const RAZORPAY_CONFIG = {
  // Environment-based keys
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_SECRET',
  
  // Supported payment methods for Tamil Nadu
  supportedMethods: {
    upi: true,           // Google Pay, PhonePe, Paytm (Most popular)
    card: true,          // Credit/Debit cards
    netbanking: true,    // All major Indian banks
    wallet: true,        // Paytm, PhonePe, Amazon Pay
    emi: true,           // EMI options
    cardless_emi: true,  // Bajaj Finserv, ZestMoney
    paylater: true,      // LazyPay, Simpl
  },
  
  // Currency and locale
  currency: 'INR',
  locale: 'en', // or 'ta' for Tamil
  
  // Business details
  company: {
    name: 'Daily Fresh Hosur',
    logo: 'https://your-logo-url.com/logo.png',
    color: '#2E7D32', // Green theme for fresh produce
  },
  
  // Tamil Nadu specific banks for NetBanking
  tamilNaduBanks: [
    'Indian Bank',
    'Indian Overseas Bank',
    'Canara Bank',
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Federal Bank',
    'Karnataka Bank'
  ]
};

class PaymentService {
  // Create Razorpay order
  async createRazorpayOrder(amount: number, orderId: string): Promise<any> {
    try {
      // This should be called from a secure backend/edge function
      // For now, we'll create a mock response
      const razorpayOrder = {
        id: `order_${Date.now()}`,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${orderId}`,
        status: 'created'
      };

      // In production, call your backend API:
      // const response = await fetch('/api/create-razorpay-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, orderId })
      // });
      // const razorpayOrder = await response.json();

      // Update order with Razorpay order ID
      await supabase
        .from('orders')
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq('id', orderId);

      return razorpayOrder;
    } catch (error) {
      console.error('Create Razorpay order error:', error);
      throw error;
    }
  }

  // Process payment with Razorpay
  async processPayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      // Get order details from Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          users!orders_user_id_fkey(email, phone, full_name)
        `)
        .eq('id', options.orderId)
        .single();

      if (error || !order) {
        throw new Error('Order not found');
      }

      // Create Razorpay order
      const razorpayOrder = await this.createRazorpayOrder(options.amount, options.orderId);

      // Prepare Razorpay checkout options
      const checkoutOptions = {
        description: options.description || `Order #${order.order_number}`,
        image: RAZORPAY_CONFIG.company.logo,
        currency: options.currency || RAZORPAY_CONFIG.currency,
        key: RAZORPAY_CONFIG.key_id,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        name: options.name || RAZORPAY_CONFIG.company.name,
        prefill: {
          email: options.prefill?.email || order.users?.email || '',
          contact: options.prefill?.contact || order.users?.phone || '',
          name: options.prefill?.name || order.users?.full_name || ''
        },
        theme: {
          color: options.theme?.color || RAZORPAY_CONFIG.company.color
        },
        method: RAZORPAY_CONFIG.supportedMethods,
        notes: {
          order_id: options.orderId,
          customer_id: order.user_id,
          delivery_address: JSON.stringify(order.delivery_address)
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
          }
        },
        remember_customer: true,
        readonly: {
          email: false,
          contact: false,
          name: false
        },
        hidden: {
          email: false,
          contact: false,
          name: false
        }
      };

      // Open Razorpay checkout
      const paymentResult = await new Promise<PaymentResult>((resolve, reject) => {
        RazorpayCheckout.open(checkoutOptions)
          .then((data: PaymentResult) => {
            resolve(data);
          })
          .catch((error: any) => {
            reject(error);
          });
      });

      // Verify payment signature (should be done on backend)
      const isValidSignature = await this.verifyPaymentSignature(
        paymentResult.razorpay_order_id,
        paymentResult.razorpay_payment_id,
        paymentResult.razorpay_signature
      );

      if (!isValidSignature) {
        throw new Error('Payment signature verification failed');
      }

      // Update order payment status
      await orderService.updatePaymentStatus(
        options.orderId,
        'paid',
        paymentResult.razorpay_payment_id,
        'razorpay'
      );

      return paymentResult;
    } catch (error) {
      console.error('Process payment error:', error);
      
      // Update order payment status to failed
      await orderService.updatePaymentStatus(options.orderId, 'failed');
      
      throw error;
    }
  }

  // Verify payment signature (should be done on secure backend)
  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      // In production, this should be done on your backend:
      // const response = await fetch('/api/verify-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, paymentId, signature })
      // });
      // return response.json();

      // For demo purposes, always return true
      // In production, verify using HMAC SHA256
      console.log('Verifying payment signature:', { orderId, paymentId, signature });
      return true;
    } catch (error) {
      console.error('Verify payment signature error:', error);
      return false;
    }
  }

  // Handle payment success
  async handlePaymentSuccess(paymentResult: PaymentResult, orderId: string): Promise<void> {
    try {
      console.log('Payment successful:', paymentResult);

      // Send confirmation SMS (integrate with SMS service)
      await this.sendPaymentConfirmationSMS(orderId);

      // Send email receipt (if email service is configured)
      await this.sendPaymentReceipt(orderId);

      // Update inventory and analytics
      await this.updatePostPaymentData(orderId);

    } catch (error) {
      console.error('Handle payment success error:', error);
    }
  }

  // Handle payment failure
  async handlePaymentFailure(error: any, orderId: string): Promise<void> {
    try {
      console.log('Payment failed:', error);

      // Update order status
      await orderService.updatePaymentStatus(orderId, 'failed');

      // Send failure notification
      await this.sendPaymentFailureNotification(orderId, error.description || 'Payment failed');

    } catch (err) {
      console.error('Handle payment failure error:', err);
    }
  }

  // Get payment methods available for user
  async getAvailablePaymentMethods(): Promise<{
    upi: boolean;
    cards: boolean;
    netbanking: boolean;
    wallets: boolean;
    cod: boolean;
    emi: boolean;
  }> {
    try {
      // Get app settings for payment methods
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'supported_payment_methods')
        .single();

      const supportedMethods = settings?.value || [
        'upi', 'card', 'netbanking', 'wallet', 'cod'
      ];

      return {
        upi: supportedMethods.includes('upi'),
        cards: supportedMethods.includes('card'),
        netbanking: supportedMethods.includes('netbanking'),
        wallets: supportedMethods.includes('wallet'),
        cod: supportedMethods.includes('cod'),
        emi: supportedMethods.includes('emi')
      };
    } catch (error) {
      console.error('Get payment methods error:', error);
      return {
        upi: true,
        cards: true,
        netbanking: true,
        wallets: true,
        cod: true,
        emi: false
      };
    }
  }

  // Calculate COD charges
  async calculateCODCharges(orderAmount: number): Promise<number> {
    try {
      // COD charges for Tamil Nadu market
      if (orderAmount >= 1000) return 0; // Free COD for orders above ₹1000
      if (orderAmount >= 500) return 15;  // ₹15 for orders above ₹500
      return 25; // ₹25 for smaller orders
    } catch (error) {
      console.error('Calculate COD charges error:', error);
      return 25;
    }
  }

  // Process COD order
  async processCODOrder(orderId: string): Promise<void> {
    try {
      // Update payment method and status
      await supabase
        .from('orders')
        .update({
          payment_method: 'cod',
          payment_status: 'pending', // Will be marked paid upon delivery
          status: 'confirmed'
        })
        .eq('id', orderId);

      // Add status history
      await orderService.addOrderStatusHistory(
        orderId,
        'confirmed',
        'Cash on Delivery order confirmed'
      );

    } catch (error) {
      console.error('Process COD order error:', error);
      throw error;
    }
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmationSMS(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select(`
          order_number,
          total_amount,
          users!orders_user_id_fkey(phone, full_name, preferred_language)
        `)
        .eq('id', orderId)
        .single();

      if (!order || !(order.users as any)?.phone) return;

      const language = (order.users as any).preferred_language || 'en';
      const message = language === 'ta' 
        ? `உங்கள் ஆர்டர் ${order.order_number} உறுதி செய்யப்பட்டது! தொகை: ₹${order.total_amount}. Daily Fresh Hosur`
        : `Your order ${order.order_number} is confirmed! Amount: ₹${order.total_amount}. Thank you for choosing Daily Fresh Hosur.`;

      // TODO: Integrate with SMS service (MSG91/Twilio)
      console.log(`SMS to ${(order.users as any).phone}: ${message}`);

    } catch (error) {
      console.error('Send payment confirmation SMS error:', error);
    }
  }

  // Send payment receipt via email
  async sendPaymentReceipt(orderId: string): Promise<void> {
    try {
      // TODO: Integrate with email service
      console.log(`Sending payment receipt for order: ${orderId}`);
    } catch (error) {
      console.error('Send payment receipt error:', error);
    }
  }

  // Send payment failure notification
  async sendPaymentFailureNotification(orderId: string, reason: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select(`
          order_number,
          users!orders_user_id_fkey(phone, preferred_language)
        `)
        .eq('id', orderId)
        .single();

      if (!order || !(order.users as any)?.phone) return;

      const language = (order.users as any).preferred_language || 'en';
      const message = language === 'ta'
        ? `ஆர்டர் ${order.order_number} பணம் செலுத்துவதில் பிரச்சனை. மீண்டும் முயற்சிக்கவும். Daily Fresh Hosur`
        : `Payment failed for order ${order.order_number}. Please try again. Daily Fresh Hosur`;

      // TODO: Send SMS notification
      console.log(`Payment failure SMS to ${(order.users as any).phone}: ${message}`);

    } catch (error) {
      console.error('Send payment failure notification error:', error);
    }
  }

  // Update post-payment data
  async updatePostPaymentData(orderId: string): Promise<void> {
    try {
      // This could include:
      // - Updating customer loyalty points
      // - Recording payment analytics
      // - Triggering post-purchase workflows
      console.log(`Updating post-payment data for order: ${orderId}`);
    } catch (error) {
      console.error('Update post-payment data error:', error);
    }
  }

  // Get payment history for user
  async getPaymentHistory(limit: number = 20): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_status,
          payment_method,
          payment_id,
          created_at
        `)
        .eq('user_id', user.id)
        .not('payment_status', 'eq', 'pending')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  // Refund payment
  async initiateRefund(orderId: string, amount?: number): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('payment_id, total_amount, payment_method')
        .eq('id', orderId)
        .single();

      if (!order || !order.payment_id) {
        throw new Error('Payment not found');
      }

      const refundAmount = amount || order.total_amount;

      // TODO: Integrate with Razorpay refund API
      // const refundResponse = await razorpay.payments.refund(order.payment_id, {
      //   amount: refundAmount * 100, // Convert to paise
      //   speed: 'normal'
      // });

      // Update order with refund information
      await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          refund_amount: refundAmount
        })
        .eq('id', orderId);

      console.log(`Refund initiated for order ${orderId}: ₹${refundAmount}`);

    } catch (error) {
      console.error('Initiate refund error:', error);
      throw error;
    }
  }
}

export default new PaymentService();