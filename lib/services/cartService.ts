import { supabase } from '../supabase';
import productService from './productService';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: any; // Will be populated with product details
}

export interface DeliverySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_slots: number;
  delivery_charge: number;
  is_available: boolean;
}

class CartService {
  // Get user's cart items
  async getCartItems(): Promise<CartItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name_en,
            name_ta,
            price,
            mrp,
            discount_percentage,
            stock_quantity,
            unit,
            images,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out items with inactive products
      const activeItems = (data || []).filter(item => item.products?.is_active);

      return activeItems;
    } catch (error) {
      console.error('Get cart items error:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      // Check if product is valid and in stock
      const product = await productService.getProductById(productId);
      
      if (!product) throw new Error('Product not found');
      if (!product.is_active) throw new Error('Product is not available');
      if (!productService.isInStock(product, quantity)) {
        throw new Error('Insufficient stock');
      }
      if (!productService.isValidQuantity(product, quantity)) {
        throw new Error(`Quantity must be between ${product.min_order_quantity} and ${product.max_order_quantity}`);
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (!productService.isInStock(product, newQuantity)) {
          throw new Error('Insufficient stock for requested quantity');
        }
        if (!productService.isValidQuantity(product, newQuantity)) {
          throw new Error(`Total quantity would exceed maximum allowed (${product.max_order_quantity})`);
        }

        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;

        return data;
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      if (quantity <= 0) {
        await this.removeFromCart(cartItemId);
        throw new Error('Item removed from cart');
      }

      // Get cart item with product details
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('id', cartItemId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!cartItem) throw new Error('Cart item not found');

      const product = cartItem.products;
      
      if (!productService.isInStock(product, quantity)) {
        throw new Error('Insufficient stock');
      }
      if (!productService.isValidQuantity(product, quantity)) {
        throw new Error(`Quantity must be between ${product.min_order_quantity} and ${product.max_order_quantity}`);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }

  // Get cart summary
  async getCartSummary() {
    try {
      const cartItems = await this.getCartItems();
      
      let subtotal = 0;
      let totalItems = 0;
      let totalSavings = 0;

      cartItems.forEach(item => {
        const product = (item as any).products;
        const effectivePrice = productService.calculateEffectivePrice(product);
        const itemTotal = effectivePrice * item.quantity;
        const itemSavings = productService.calculateSavings(product) * item.quantity;

        subtotal += itemTotal;
        totalItems += item.quantity;
        totalSavings += itemSavings;
      });

      const gstAmount = subtotal * 0.18; // 18% GST
      const cgstAmount = subtotal * 0.09; // 9% CGST
      const sgstAmount = subtotal * 0.09; // 9% SGST

      return {
        items: cartItems,
        itemCount: cartItems.length,
        totalQuantity: totalItems,
        subtotal,
        cgstAmount,
        sgstAmount,
        gstAmount,
        totalSavings,
        deliveryCharge: 0, // Will be calculated based on delivery slot
        total: subtotal + gstAmount
      };
    } catch (error) {
      console.error('Get cart summary error:', error);
      throw error;
    }
  }

  // Get available delivery slots
  async getAvailableDeliverySlots(days: number = 7): Promise<DeliverySlot[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabase
        .from('delivery_slots')
        .select('*')
        .eq('is_available', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .lt('booked_slots', supabase.rpc('capacity'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get delivery slots error:', error);
      throw error;
    }
  }

  // Calculate delivery charge based on address and cart value
  async calculateDeliveryCharge(deliverySlotId: string, cartValue: number): Promise<number> {
    try {
      const { data: slot, error } = await supabase
        .from('delivery_slots')
        .select('delivery_charge')
        .eq('id', deliverySlotId)
        .single();

      if (error) throw error;

      // Check for free delivery threshold
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'free_delivery_threshold')
        .single();

      const freeDeliveryThreshold = settings?.value || 500;

      if (cartValue >= freeDeliveryThreshold) {
        return 0;
      }

      return slot.delivery_charge || 25;
    } catch (error) {
      console.error('Calculate delivery charge error:', error);
      return 25; // Default delivery charge
    }
  }

  // Validate cart before checkout
  async validateCart(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const cartItems = await this.getCartItems();
      const errors: string[] = [];

      if (cartItems.length === 0) {
        errors.push('Cart is empty');
        return { isValid: false, errors };
      }

      // Check each item
      for (const item of cartItems) {
        const product = (item as any).products;

        if (!product.is_active) {
          errors.push(`${product.name_en} is no longer available`);
          continue;
        }

        if (!productService.isInStock(product, item.quantity)) {
          errors.push(`${product.name_en} has insufficient stock (Available: ${product.stock_quantity})`);
        }

        if (!productService.isValidQuantity(product, item.quantity)) {
          errors.push(`${product.name_en} quantity should be between ${product.min_order_quantity} and ${product.max_order_quantity}`);
        }
      }

      // Check minimum order amount
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'min_order_amount')
        .single();

      const minOrderAmount = settings?.value || 100;
      const summary = await this.getCartSummary();

      if (summary.subtotal < minOrderAmount) {
        errors.push(`Minimum order amount is ₹${minOrderAmount}`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Validate cart error:', error);
      return {
        isValid: false,
        errors: ['Failed to validate cart']
      };
    }
  }

  // Get cart item count
  async getCartItemCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;

      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Get cart item count error:', error);
      return 0;
    }
  }

  // Check if product is in cart
  async isProductInCart(productId: string): Promise<{ inCart: boolean; quantity: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { inCart: false, quantity: 0 };

      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return { inCart: false, quantity: 0 };
        throw error;
      }

      return { inCart: true, quantity: data.quantity };
    } catch (error) {
      console.error('Check product in cart error:', error);
      return { inCart: false, quantity: 0 };
    }
  }

  // Sync cart with local storage (for offline support)
  async syncCartWithLocal(localCartItems: { productId: string; quantity: number }[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get current cart
      const currentCart = await this.getCartItems();
      const currentCartMap = new Map(currentCart.map(item => [item.product_id, item]));

      // Sync local items
      for (const localItem of localCartItems) {
        const existingItem = currentCartMap.get(localItem.productId);
        
        if (existingItem) {
          // Update if quantities differ
          if (existingItem.quantity !== localItem.quantity) {
            await this.updateCartItem(existingItem.id, localItem.quantity);
          }
        } else {
          // Add new item
          try {
            await this.addToCart(localItem.productId, localItem.quantity);
          } catch {
            // Skip if product not available
          }
        }
      }
    } catch (error) {
      console.error('Sync cart with local error:', error);
    }
  }
}

export default new CartService();