 
// app/services/payment/paymentGateway.ts
import paypalService from './paypalService';
import razorpayService from './razorpayService';
import stripeService from './stripeService';

export type PaymentGatewayType = 'stripe' | 'razorpay' | 'paypal';

export interface PaymentData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  gateway: PaymentGatewayType;
}

class PaymentGateway {
  private gateways: Record<PaymentGatewayType, any>;

  constructor() {
    this.gateways = {
      stripe: stripeService,
      razorpay: razorpayService,
      paypal: paypalService,
    };
  }

  async processPayment(gateway: PaymentGatewayType, paymentData: PaymentData): Promise<PaymentResult> {
    const service = this.gateways[gateway];
    if (!service) {
      throw new Error(`Payment gateway ${gateway} not supported`);
    }

    try {
      const result = await service.processPayment(paymentData);
      return {
        ...result,
        gateway,
      };
    } catch (error) {
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializePayment(gateway: PaymentGatewayType, amount: number, currency: string = 'AED'): Promise<any> {
    const service = this.gateways[gateway];
    if (!service) {
      throw new Error(`Payment gateway ${gateway} not supported`);
    }

    try {
      if (gateway === 'stripe') {
        return await service.createPaymentIntent(amount, currency);
      } else if (gateway === 'razorpay') {
        return await service.createOrder({ amount, currency, receipt: `receipt_${Date.now()}` });
      } else if (gateway === 'paypal') {
        return await service.createOrder({ amount, currency, description: 'Grocery Order' });
      }
    } catch (error) {
      throw new Error(`Failed to initialize payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyPayment(gateway: PaymentGatewayType, paymentId: string): Promise<any> {
    const service = this.gateways[gateway];
    if (!service) {
      throw new Error(`Payment gateway ${gateway} not supported`);
    }

    try {
      return await service.verify(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refundPayment(gateway: PaymentGatewayType, paymentId: string, amount: number, currency: string = 'AED'): Promise<any> {
    const service = this.gateways[gateway];
    if (!service) {
      throw new Error(`Payment gateway ${gateway} not supported`);
    }

    try {
      if (gateway === 'paypal') {
        return await service.refund(paymentId, amount, currency);
      } else {
        return await service.refund(paymentId, amount);
      }
    } catch (error) {
      throw new Error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getSupportedGateways(): PaymentGatewayType[] {
    return Object.keys(this.gateways) as PaymentGatewayType[];
  }

  isGatewaySupported(gateway: string): gateway is PaymentGatewayType {
    return gateway in this.gateways;
  }
}

export default new PaymentGateway();