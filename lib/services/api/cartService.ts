import { ApiResponse } from '../../types/api';
import { CartItem, Coupon } from '../../types/cart';
import apiClient from './apiClient';

class CartService {
  // Get user's cart from server
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return await apiClient.get('/cart');
  }

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      return await apiClient.post('/cart/add', {
        productId,
        quantity,
      });
    } catch (error: any) {
      // Handle backend unavailability - work in offline mode
      if (error.response?.status === 404 || error.code === 'NETWORK_ERROR' || error.message?.includes('ECONNREFUSED')) {
        console.log('Backend not available, working in offline mode');
        // Return a mock successful response for offline functionality
        return {
          success: true,
          data: {
            id: `offline_${Date.now()}`,
            productId,
            quantity,
            price: 0,
            totalPrice: 0,
          } as CartItem,
          message: 'Added to cart (offline mode)'
        };
      }
      throw error;
    }
  }

  // Update item quantity in cart
  async updateCartItem(cartItemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return await apiClient.patch(`/cart/items/${cartItemId}`, {
      quantity,
    });
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete(`/cart/items/${cartItemId}`);
  }

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<void>> {
    return await apiClient.delete('/cart');
  }

  // Apply coupon to cart
  async applyCoupon(couponCode: string): Promise<ApiResponse<Coupon>> {
    return await apiClient.post('/cart/apply-coupon', {
      couponCode: couponCode.toUpperCase(),
    });
  }

  // Remove coupon from cart
  async removeCoupon(): Promise<ApiResponse<void>> {
    return await apiClient.delete('/cart/coupon');
  }

  // Validate coupon code
  async validateCoupon(couponCode: string, cartTotal: number): Promise<ApiResponse<{
    isValid: boolean;
    discount: number;
    message?: string;
  }>> {
    return await apiClient.post('/cart/validate-coupon', {
      couponCode: couponCode.toUpperCase(),
      cartTotal,
    });
  }

  // Get available coupons for user
  async getAvailableCoupons(): Promise<ApiResponse<Coupon[]>> {
    return await apiClient.get('/coupons/available');
  }

  // Sync cart between devices
  async syncCart(localCartItems: CartItem[]): Promise<ApiResponse<CartItem[]>> {
    return await apiClient.post('/cart/sync', {
      localItems: localCartItems,
    });
  }

  // Calculate cart totals
  async calculateTotals(cartItems: CartItem[], couponCode?: string, deliveryAddress?: any): Promise<ApiResponse<{
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    vatAmount: number;
    total: number;
  }>> {
    return await apiClient.post('/cart/calculate', {
      items: cartItems,
      couponCode,
      deliveryAddress,
    });
  }

  // Check item availability and stock
  async checkItemsAvailability(productIds: string[]): Promise<ApiResponse<Array<{
    productId: string;
    isAvailable: boolean;
    stock: number;
    price: number;
    discountedPrice?: number;
  }>>> {
    return await apiClient.post('/cart/check-availability', {
      productIds,
    });
  }
}

export default new CartService();