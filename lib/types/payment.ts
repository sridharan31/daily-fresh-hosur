// Payment method types
export type PaymentMethodType = 'card' | 'upi' | 'wallet' | 'cod' | 'bank_transfer' | 'apple_pay' | 'google_pay';

// Payment result interface
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  providerResponse?: any;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Payment status types
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially_refunded'
  | 'expired';

// Refund status types
export type RefundStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

// Card types
export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unknown';

// Payment provider types
export type PaymentProvider = 'stripe' | 'razorpay' | 'paypal';

// Base payment method interface
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  provider?: PaymentProvider;
  details?: PaymentMethodDetails;
  createdAt: string;
  updatedAt: string;
}

// Payment method details based on type
export interface PaymentMethodDetails {
  // Card details
  last4?: string;
  brand?: CardType;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  fingerprint?: string;
  
  // UPI details
  upiId?: string;
  upiHandle?: string;
  
  // Wallet details
  walletId?: string;
  walletProvider?: string;
  balance?: number;
  
  // Bank transfer details
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  accountType?: 'checking' | 'savings';
  
  // Digital wallet details (Apple Pay, Google Pay)
  deviceId?: string;
  tokenId?: string;
}

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTransactionId?: string;
  providerResponse?: any;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Payment intent for processing
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  paymentMethodId?: string;
  status: PaymentStatus;
  clientSecret?: string;
  confirmationMethod?: 'automatic' | 'manual';
  captureMethod?: 'automatic' | 'manual';
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt: string;
}

// Refund interface
export interface Refund {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  provider: PaymentProvider;
  providerRefundId?: string;
  providerResponse?: any;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment request for creating payment
export interface CreatePaymentRequest {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  savePaymentMethod?: boolean;
  confirmationMethod?: 'automatic' | 'manual';
  returnUrl?: string;
  metadata?: Record<string, any>;
}

// Payment confirmation request
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

// Add payment method request
export interface AddPaymentMethodRequest {
  type: PaymentMethodType;
  token?: string; // Token from payment provider
  details: Partial<PaymentMethodDetails>;
  setAsDefault?: boolean;
}

// Update payment method request
export interface UpdatePaymentMethodRequest {
  name?: string;
  isDefault?: boolean;
  details?: Partial<PaymentMethodDetails>;
}

// Refund request
export interface CreateRefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, any>;
}

// Payment verification response
export interface PaymentVerificationResponse {
  isValid: boolean;
  transactionId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  verifiedAt: string;
  details?: any;
}

// Coupon interface for discounts
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number; // Percentage (0-100) or fixed amount
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  firstTimeUserOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Applied coupon in cart/order
export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedAt: string;
}

// Payment summary for orders
export interface PaymentSummary {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  vatAmount: number;
  total: number;
  currency: string;
  appliedCoupon?: AppliedCoupon;
  paymentMethod?: PaymentMethod;
}

// Payment gateway configuration
export interface PaymentGatewayConfig {
  provider: PaymentProvider;
  publicKey: string;
  isEnabled: boolean;
  supportedMethods: PaymentMethodType[];
  supportedCurrencies: string[];
  minAmount?: number;
  maxAmount?: number;
  processingFee?: number;
  processingFeeType?: 'percentage' | 'fixed';
}

// Payment analytics data
export interface PaymentAnalytics {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  averageTransactionAmount: number;
  topPaymentMethods: Array<{
    type: PaymentMethodType;
    count: number;
    percentage: number;
  }>;
  failureReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    transactions: number;
    amount: number;
    successRate: number;
  }>;
}

// Webhook event types for payment updates
export interface PaymentWebhookEvent {
  id: string;
  type: 'payment.succeeded' | 'payment.failed' | 'refund.created' | 'refund.completed';
  data: {
    object: PaymentTransaction | Refund;
  };
  createdAt: string;
  processed: boolean;
}

// Payment data interface
export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  paymentMethodId: string;
  gateway: PaymentProvider;
  savePaymentMethod?: boolean;
  setupFutureUsage?: 'on_session' | 'off_session';
  metadata?: Record<string, any>;
  returnUrl?: string;
  description?: string;
  statementDescriptor?: string;
}

// Payment form validation
export interface PaymentFormValidation {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  holderName?: string;
  upiId?: string;
  isValid: boolean;
}

// Payment processing options
export interface PaymentProcessingOptions {
  savePaymentMethod?: boolean;
  confirmationMethod?: 'automatic' | 'manual';
  captureMethod?: 'automatic' | 'manual';
  setupFutureUsage?: 'on_session' | 'off_session';
  statementDescriptor?: string;
  receiptEmail?: string;
}

// Installment options
export interface InstallmentOption {
  id: string;
  months: number;
  interestRate: number;
  monthlyAmount: number;
  totalAmount: number;
  provider: string;
  isAvailable: boolean;
}

// Buy now pay later options
export interface BuyNowPayLaterOption {
  id: string;
  provider: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  paymentSchedule: Array<{
    dueDate: string;
    amount: number;
  }>;
  isAvailable: boolean;
}

// Payment security features
export interface PaymentSecurity {
  is3DSecureEnabled: boolean;
  fraudDetectionEnabled: boolean;
  tokenizationEnabled: boolean;
  encryptionLevel: 'basic' | 'advanced';
  complianceStandards: string[]; // PCI DSS, etc.
}

// Recurring payment setup
export interface RecurringPaymentSetup {
  id: string;
  customerId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;
  startDate: string;
  endDate?: string;
  maxOccurrences?: number;
  currentOccurrence: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  nextPaymentDate: string;
  createdAt: string;
  updatedAt: string;
}

