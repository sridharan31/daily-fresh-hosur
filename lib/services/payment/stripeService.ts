 // app/services/payment/stripeService.ts
import { confirmPayment, BillingDetails } from '@stripe/stripe-react-native';

export interface StripePaymentData {
  clientSecret: string;
  billingDetails: BillingDetails;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

class StripeService {
  private publishableKey: string | null = null;

  initialize(publishableKey: string): void {
    this.publishableKey = publishableKey;
  }

  async processPayment(paymentData: StripePaymentData): Promise<PaymentResult> {
    const { clientSecret, billingDetails } = paymentData;
    
    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!paymentIntent) {
      throw new Error('Payment intent not returned');
    }

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  async createPaymentIntent(amount: number, currency: string = 'AED'): Promise<PaymentIntentResponse> {
    try {
      // This would typically call your backend to create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verify(paymentIntentId: string): Promise<any> {
    try {
      const response = await fetch(`/api/payment/verify/${paymentIntentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refund(paymentIntentId: string, amount: number): Promise<any> {
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new StripeService();
