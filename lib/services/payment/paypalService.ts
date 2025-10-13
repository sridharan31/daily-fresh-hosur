// app/services/payment/paypalService.ts

export interface PaypalPaymentData {
  amount: number;
  currency: string;
  description: string;
  intent?: 'sale' | 'authorize' | 'order';
}

export interface PaypalPaymentResponse {
  id: string;
  state: string;
  create_time: string;
  update_time: string;
  amount: {
    total: string;
    currency: string;
  };
}

export interface PaypalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

class PaypalService {
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private environment: 'sandbox' | 'production' = 'sandbox';

  initialize(clientId: string, clientSecret: string, environment: 'sandbox' | 'production' = 'sandbox'): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.environment = environment;
  }

  private getBaseUrl(): string {
    return this.environment === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw new Error(`Failed to get PayPal access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOrder(orderData: PaypalPaymentData): Promise<PaypalOrderResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: orderData.intent || 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: orderData.currency,
              value: orderData.amount.toString(),
            },
            description: orderData.description,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPayment(paymentData: PaypalPaymentData): Promise<PaypalOrderResponse> {
    try {
      // Create order first
      const order = await this.createOrder(paymentData);
      
      // In a real implementation, you would redirect to PayPal checkout here
      // For now, we'll return the order details
      return order;
    } catch (error) {
      throw new Error(`Failed to process PayPal payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to capture PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verify(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to verify PayPal payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refund(captureId: string, amount: number, currency: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.getBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: {
            value: amount.toString(),
            currency_code: currency,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to process PayPal refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new PaypalService();

