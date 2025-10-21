import { CartItem as DatabaseCartItem, Product } from '../../types/database';
import { supabase } from '../client';
import { safeInsert, safeUpdate } from '../utils/databaseUtils';

export type CartItem = DatabaseCartItem & {
  product: Product;
};

// Cart service for Supabase
export const cartService = {
  // Get user's cart items with product details
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      // Join cart_items with products to get full product details
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []) as unknown as CartItem[];
    } catch (error) {
      console.error('Get cart items error:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      // Check if product is already in the cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity if product is already in cart
        const query = supabase.from('cart_items').eq('id', existingItem.id);
        const { error: updateError } = await safeUpdate(query, { 
          quantity: existingItem.quantity + quantity 
        });

        if (updateError) throw updateError;
      } else {
        // Insert new cart item if product is not in cart
        const query = supabase.from('cart_items');
        const { error: insertError } = await safeInsert(query, {
          user_id: userId,
          product_id: productId,
          quantity: quantity
        });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    try {
      // We need to use a filter first, then use our safeUpdate
      const baseQuery = supabase.from('cart_items');
      const { error } = await baseQuery
        .update({ quantity }) // This is now type-safe with our DatabaseCartItem type
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Update cart item quantity error:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },

  // Clear user's cart
  async clearCart(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  // Set up real-time subscription for cart updates
  subscribeToCartUpdates(userId: string, onUpdate: (items: CartItem[]) => void) {
    return supabase
      .channel(`cart-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'cart_items',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // When cart changes, fetch the updated cart items
          try {
            const items = await this.getCartItems(userId);
            onUpdate(items);
          } catch (error) {
            console.error('Error fetching updated cart items:', error);
          }
        }
      )
      .subscribe();
  }
};