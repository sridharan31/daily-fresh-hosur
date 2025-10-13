// app/services/payment/razorpayService.ts

export interface RazorpayPaymentData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  private keyId: string | null = null;
  private keySecret: string | null = null;

  initialize(keyId: string, keySecret: string): void {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder(orderData: RazorpayPaymentData): Promise<RazorpayOrderResponse> {
    try {
      const response = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPayment(paymentData: RazorpayPaymentData): Promise<RazorpayOrderResponse> {
    try {
      // Create order first
      const order = await this.createOrder(paymentData);
      
      // In a real implementation, you would open Razorpay checkout here
      // For now, we'll return the order details
      return order;
    } catch (error) {
      throw new Error(`Failed to process Razorpay payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verify(paymentResponse: RazorpayPaymentResponse): Promise<any> {
    try {
      const response = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentResponse),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to verify Razorpay payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refund(paymentId: string, amount: number): Promise<any> {
    try {
      const response = await fetch('/api/payment/razorpay/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to process Razorpay refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`/api/payment/razorpay/payment/${paymentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get Razorpay payment details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new RazorpayService();

