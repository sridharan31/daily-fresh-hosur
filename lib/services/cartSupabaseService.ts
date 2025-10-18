import { supabase } from '../supabase';
import { ApiResponse } from '../types/api';
import { CartItem, Coupon } from '../types/cart';

class CartSupabaseService {
  // Get user's cart from Supabase
  async getCart(userId: string): Promise<ApiResponse<CartItem[]>> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id, 
          product_id,
          quantity,
          products(*)
        `)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Transform the data to match CartItem interface
      const cartItems: CartItem[] = data.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.products.name_en,
        image: item.products.images?.[0] || '',
        unit: item.products.unit,
        price: item.products.price,
        discountedPrice: item.products.discount_percentage > 0 
          ? item.products.price * (1 - item.products.discount_percentage / 100) 
          : undefined,
        quantity: item.quantity,
        maxQuantity: item.products.max_order_quantity || 10,
        isAvailable: item.products.is_active && item.products.stock_quantity > 0,
        product: item.products,
        totalPrice: item.quantity * item.products.price,
      }));

      return {
        success: true,
        data: cartItems,
        message: 'Cart retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        message: 'Error retrieving cart',
        error: error.message
      };
    }
  }

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw fetchError;
      }

      let result;
      if (existingItems) {
        // Update quantity if item exists
        const newQuantity = existingItems.quantity + quantity;
        result = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItems.id)
          .select(`
            id, 
            product_id,
            quantity,
            products(*)
          `)
          .single();
      } else {
        // Insert new item if it doesn't exist
        result = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity
          })
          .select(`
            id, 
            product_id,
            quantity,
            products(*)
          `)
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Transform to CartItem format
      const item = result.data;
      const cartItem: CartItem = {
        id: item.id,
        productId: item.product_id,
        name: item.products.name_en,
        image: item.products.images?.[0] || '',
        unit: item.products.unit,
        price: item.products.price,
        discountedPrice: item.products.discount_percentage > 0 
          ? item.products.price * (1 - item.products.discount_percentage / 100) 
          : undefined,
        quantity: item.quantity,
        maxQuantity: item.products.max_order_quantity || 10,
        isAvailable: item.products.is_active && item.products.stock_quantity > 0,
        product: item.products,
        totalPrice: item.quantity * item.products.price,
      };

      return {
        success: true,
        data: cartItem,
        message: 'Item added to cart successfully'
      };
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      return {
        success: false,
        message: 'Error adding item to cart',
        error: error.message
      };
    }
  }

  // Update item quantity in cart
  async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    try {
      // First verify the cart item belongs to user
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Update the quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select(`
          id, 
          product_id,
          quantity,
          products(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Transform to CartItem format
      const cartItem: CartItem = {
        id: data.id,
        productId: data.product_id,
        name: data.products.name_en,
        image: data.products.images?.[0] || '',
        unit: data.products.unit,
        price: data.products.price,
        discountedPrice: data.products.discount_percentage > 0 
          ? data.products.price * (1 - data.products.discount_percentage / 100) 
          : undefined,
        quantity: data.quantity,
        maxQuantity: data.products.max_order_quantity || 10,
        isAvailable: data.products.is_active && data.products.stock_quantity > 0,
        product: data.products,
        totalPrice: data.quantity * data.products.price,
      };

      return {
        success: true,
        data: cartItem,
        message: 'Cart item updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: 'Error updating cart item',
        error: error.message
      };
    }
  }

  // Remove item from cart
  async removeFromCart(userId: string, cartItemId: string): Promise<ApiResponse<string>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: cartItemId,
        message: 'Item removed from cart successfully'
      };
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      return {
        success: false,
        message: 'Error removing item from cart',
        error: error.message
      };
    }
  }

  // Clear entire cart
  async clearCart(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Cart cleared successfully'
      };
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: 'Error clearing cart',
        error: error.message
      };
    }
  }
  // Apply coupon to cart
  async applyCoupon(couponCode: string): Promise<ApiResponse<Coupon>> {
    try {
      // Uppercase the coupon code for consistent matching
      couponCode = couponCode.toUpperCase();

      // Get current date
      const now = new Date().toISOString();
      
      // Query the coupons table
      const { data: couponData, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .gte('valid_until', now)
        .lte('valid_from', now)
        .single();

      if (error || !couponData) {
        console.error('Error fetching coupon:', error);
        return {
          success: false,
          message: 'Invalid or expired coupon code',
          error: error?.message || 'Coupon not found'
        };
      }

      // Check if the coupon has reached its usage limit
      if (couponData.usage_limit !== null && couponData.used_count >= couponData.usage_limit) {
        return {
          success: false,
          message: 'This coupon has reached its maximum usage limit',
          error: 'Coupon usage limit reached'
        };
      }

      // Return the coupon data
      const coupon: Coupon = {
        id: couponData.id,
        code: couponData.code,
        title: couponData.title_en,
        description: couponData.description_en,
        discountType: couponData.discount_type,
        value: couponData.discount_value,
        minOrderAmount: couponData.min_order_amount,
        maxDiscountAmount: couponData.max_discount_amount,
        validUntil: couponData.valid_until,
      };

      return {
        success: true,
        data: coupon,
        message: 'Coupon applied successfully'
      };
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      return {
        success: false,
        message: 'Error applying coupon',
        error: error.message
      };
    }
  }

  // Remove coupon from cart - this is handled client-side in Redux
  async removeCoupon(): Promise<ApiResponse<void>> {
    return {
      success: true,
      message: 'Coupon removed successfully'
    };
  }

  // Validate coupon code
  async validateCoupon(couponCode: string, cartTotal: number): Promise<ApiResponse<{
    isValid: boolean;
    coupon?: Coupon;
    message?: string;
  }>> {
    try {
      const response = await this.applyCoupon(couponCode);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          data: {
            isValid: false,
            message: response.message || 'Invalid coupon'
          }
        };
      }

      const coupon = response.data;
      
      // Check minimum order amount
      if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
        return {
          success: true,
          data: {
            isValid: false,
            coupon,
            message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
          }
        };
      }

      return {
        success: true,
        data: {
          isValid: true,
          coupon,
          message: 'Coupon is valid'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          isValid: false,
          message: error.message || 'Error validating coupon'
        },
        error: error.message
      };
    }
  }
}

export default new CartSupabaseService();