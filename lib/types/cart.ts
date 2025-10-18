import { Product } from "./product";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  unit: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  maxQuantity: number;
  isAvailable: boolean;
  product: Product;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  coupon?: Coupon;
  updatedAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  title?: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validUntil?: string;
  type?: 'percentage' | 'fixed'; // For backwards compatibility
  minOrderValue?: number; // For backwards compatibility
  maxDiscount?: number; // For backwards compatibility
  expiryDate?: string; // For backwards compatibility
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  vatAmount: number;
  total: number;
  totalAmount: number;
  appliedCoupon: Coupon | null;
  coupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
}

