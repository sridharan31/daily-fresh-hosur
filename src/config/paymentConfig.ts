 // app/config/paymentConfig.ts
import Config from './environment';

export interface PaymentGatewayConfig {
  name: string;
  displayName: string;
  enabled: boolean;
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  supportedMethods: string[];
  currencies: string[];
  features: {
    refunds: boolean;
    subscriptions: boolean;
    multiParty: boolean;
    webhooks: boolean;
  };
}

export interface StripeConfig extends PaymentGatewayConfig {
  publishableKey: string;
  merchantId?: string;
  appleMerchantId?: string;
}

export interface RazorpayConfig extends PaymentGatewayConfig {
  keyId: string;
  keySecret?: string;
  webhookSecret?: string;
  theme: {
    color: string;
    backdrop_color: string;
  };
}

export interface PayPalConfig extends PaymentGatewayConfig {
  clientId: string;
  clientSecret?: string;
  intent: 'sale' | 'authorize';
}

const stripeConfig: StripeConfig = {
  name: 'stripe',
  displayName: 'Credit/Debit Card',
  enabled: true,
  apiKey: Config.STRIPE_PUBLISHABLE_KEY,
  publishableKey: Config.STRIPE_PUBLISHABLE_KEY,
  environment: Config.APP_ENV === 'production' ? 'production' : 'sandbox',
  supportedMethods: ['card', 'apple_pay', 'google_pay'],
  currencies: ['AED', 'USD', 'EUR'],
  features: {
    refunds: true,
    subscriptions: true,
    multiParty: false,
    webhooks: true,
  },
  merchantId: 'merchant.com.groceryapp',
  appleMerchantId: 'merchant.com.groceryapp.apple',
};

const razorpayConfig: RazorpayConfig = {
  name: 'razorpay',
  displayName: 'UPI & Digital Wallets',
  enabled: true,
  apiKey: Config.RAZORPAY_KEY_ID,
  keyId: Config.RAZORPAY_KEY_ID,
  environment: Config.APP_ENV === 'production' ? 'production' : 'sandbox',
  supportedMethods: ['upi', 'wallet', 'netbanking', 'card'],
  currencies: ['INR', 'AED'],
  features: {
    refunds: true,
    subscriptions: true,
    multiParty: true,
    webhooks: true,
  },
  theme: {
    color: '#4CAF50',
    backdrop_color: 'rgba(76, 175, 80, 0.1)',
  },
};

const paypalConfig: PayPalConfig = {
  name: 'paypal',
  displayName: 'PayPal',
  enabled: true,
  apiKey: Config.PAYPAL_CLIENT_ID,
  clientId: Config.PAYPAL_CLIENT_ID,
  environment: Config.APP_ENV === 'production' ? 'production' : 'sandbox',
  supportedMethods: ['paypal', 'credit', 'paylater'],
  currencies: ['USD', 'EUR', 'AED'],
  features: {
    refunds: true,
    subscriptions: false,
    multiParty: false,
    webhooks: true,
  },
  intent: 'sale',
};

export interface PaymentConfig {
  gateways: {
    stripe: StripeConfig;
    razorpay: RazorpayConfig;
    paypal: PayPalConfig;
  };
  defaultGateway: string;
  defaultCurrency: string;
  minimumAmount: number;
  maximumAmount: number;
  codEnabled: boolean;
  codCharges: number;
  processingFee: number;
  refundProcessingDays: number;
  autoRefundEnabled: boolean;
  paymentMethods: {
    card: {
      enabled: boolean;
      label: string;
      icon: string;
    };
    upi: {
      enabled: boolean;
      label: string;
      icon: string;
    };
    wallet: {
      enabled: boolean;
      label: string;
      icon: string;
    };
    cod: {
      enabled: boolean;
      label: string;
      icon: string;
      minimumAmount: number;
      maximumAmount: number;
    };
    paypal: {
      enabled: boolean;
      label: string;
      icon: string;
    };
  };
}

export const paymentConfig: PaymentConfig = {
  gateways: {
    stripe: stripeConfig,
    razorpay: razorpayConfig,
    paypal: paypalConfig,
  },
  defaultGateway: 'stripe',
  defaultCurrency: Config.DEFAULT_CURRENCY,
  minimumAmount: 10, // AED
  maximumAmount: 5000, // AED
  codEnabled: true,
  codCharges: 5, // AED
  processingFee: 0, // No processing fee
  refundProcessingDays: 5,
  autoRefundEnabled: true,
  paymentMethods: {
    card: {
      enabled: true,
      label: 'Credit/Debit Card',
      icon: 'credit-card',
    },
    upi: {
      enabled: true,
      label: 'UPI Payment',
      icon: 'account-balance',
    },
    wallet: {
      enabled: true,
      label: 'Digital Wallet',
      icon: 'account-balance-wallet',
    },
    cod: {
      enabled: true,
      label: 'Cash on Delivery',
      icon: 'money',
      minimumAmount: 20, // AED
      maximumAmount: 500, // AED
    },
    paypal: {
      enabled: true,
      label: 'PayPal',
      icon: 'payment',
    },
  },
};

// Payment error codes
export const PAYMENT_ERROR_CODES = {
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CARD_DECLINED: 'CARD_DECLINED',
  EXPIRED_CARD: 'EXPIRED_CARD',
  INVALID_CARD: 'INVALID_CARD',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GATEWAY_ERROR: 'GATEWAY_ERROR',
} as const;

export type PaymentErrorCode = typeof PAYMENT_ERROR_CODES[keyof typeof PAYMENT_ERROR_CODES];



// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function ConfigRouteNotFound() { return null; }
