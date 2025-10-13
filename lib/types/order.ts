import { Address } from "./auth";
import { CartItem, Coupon } from "./cart";
import { DeliverySlot } from "./delivery";

 export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliverySlot: DeliverySlot;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  coupon?: Coupon;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  orderTracking: OrderTrackingInfo | null;
  isLoading: boolean;
  creating: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface OrderTrackingInfo {
  orderId: string;
  status: OrderStatus;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedDelivery: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  updates: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
}

export interface CreateOrderRequest {
  cartItems: CartItem[];
  deliveryAddress: Address;
  paymentMethodId: string;
  deliverySlot: DeliverySlot;
  specialInstructions?: string;
  couponCode?: string;
}

export interface CancelOrderRequest {
  reason: string;
  refundToOriginalPayment?: boolean;
}
