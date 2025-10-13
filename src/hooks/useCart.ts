import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cartService from '../../lib/services/api/cartService';
import FirebaseService from '../../lib/services/FirebaseService';
import { AppDispatch, RootState } from '../../lib/store';
import {
    addLocalItem,
    addToCart,
    applyCouponCode,
    clearCart,
    removeCoupon,
    removeFromCart,
    removeLocalItem,
    setDeliveryCharge,
    syncCartWithServer,
    updateQuantity,
} from '../../lib/store/slices/cartSlice';
import { CartItem } from '../../lib/types/cart';
import { Product } from '../../lib/types/product';
import Config from '../config/environment';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);
  
  // Get cart state directly from RootState
  const cartState = useSelector((state: RootState) => state.cart);

  const {
    items = [],
    totalAmount = 0,
    discount = 0,
    coupon = null,
    isLoading = false,
    error = null,
  } = cartState || {};

  // Ensure items is always an array and calculate derived values safely
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((total: number, item: CartItem) => total + (item.totalPrice || 0), 0);
  const itemCount = safeItems.reduce((count: number, item: CartItem) => count + (item.quantity || 0), 0);
  const deliveryCharge = subtotal > Config.FREE_DELIVERY_THRESHOLD || 50 ? 0 : Config.STANDARD_DELIVERY_CHARGE || 5;
  const vatAmount = subtotal * 0.05; // 5% VAT
  const total = subtotal + deliveryCharge + vatAmount - discount;
  const appliedCoupon = coupon;

  // Auto-sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated]);

  // Auto-calculate delivery charges when cart changes
  useEffect(() => {
    calculateDeliveryCharges();
  }, [items, subtotal]);

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      // Add to local state immediately for better UX
      dispatch(addLocalItem({product, quantity}));

      // Track in analytics
      if (Config.ENABLE_ANALYTICS) {
        await FirebaseService.logEvent('add_to_cart', {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          quantity,
          value: product.price,
          currency: Config.DEFAULT_CURRENCY || 'USD',
        });
      }

      // Sync with server if authenticated
      if (isAuthenticated) {
        await dispatch(addToCart({productId: product.id, quantity}));
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }, [dispatch, isAuthenticated]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      // Remove from local state
      dispatch(removeLocalItem(itemId));

      // Track removal in analytics
      if (Config.ENABLE_ANALYTICS) {
        const removedItem = items.find((item: CartItem) => item.id === itemId);
        if (removedItem) {
          await FirebaseService.logEvent('remove_from_cart', {
            item_id: removedItem.product.id,
            item_name: removedItem.name,
            item_category: removedItem.product.category,
            quantity_removed: removedItem.quantity,
            value: removedItem.totalPrice,
            currency: Config.DEFAULT_CURRENCY || 'USD',
          });
        }
      }

      // Sync with server if authenticated
      if (isAuthenticated) {
        await dispatch(removeFromCart(itemId));
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }, [dispatch, isAuthenticated, items]);

  const removeMultipleItems = useCallback(async (itemIds: string[]) => {
    try {
      // Remove all items locally
      itemIds.forEach(itemId => {
        dispatch(removeLocalItem(itemId));
      });

      // Track bulk removal
      if (Config.ENABLE_ANALYTICS) {
        await FirebaseService.logEvent('bulk_remove_from_cart', {
          items_count: itemIds.length,
          cart_value_before: subtotal,
        });
      }

      // Sync with server if authenticated
      if (isAuthenticated) {
        await Promise.all(itemIds.map(itemId => dispatch(removeFromCart(itemId))));
      }
    } catch (error) {
      console.error('Error removing multiple items from cart:', error);
    }
  }, [dispatch, isAuthenticated, subtotal]);

  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      // Update local state
      dispatch(updateQuantity({itemId, quantity}));

      // Sync with server if authenticated
      if (isAuthenticated) {
        await dispatch(updateQuantity({itemId, quantity}));
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  }, [dispatch, isAuthenticated]);

  const clearAllItems = useCallback(async () => {
    try {
      // Clear local state
      dispatch(clearCart());

      // Clear server cart if authenticated
      if (isAuthenticated) {
        await cartService.clearCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [dispatch, isAuthenticated]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const result = await dispatch(applyCouponCode(code));
      
      // Track coupon usage in analytics
      if (Config.ENABLE_ANALYTICS && result.type.endsWith('fulfilled')) {
        await FirebaseService.logEvent('coupon_applied', {
          coupon_code: code,
          cart_value: subtotal,
          discount_amount: (result.payload as any).value,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }, [dispatch, subtotal]);

  const removeCouponCode = useCallback(async () => {
    try {
      dispatch(removeCoupon());
      
      if (isAuthenticated) {
        await cartService.removeCoupon();
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  }, [dispatch, isAuthenticated]);

  const syncCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await dispatch(syncCartWithServer());
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    }
  }, [dispatch, isAuthenticated]);

  const calculateDeliveryCharges = useCallback(async () => {
    try {
      // Simple delivery charge calculation
      let charge = 0;
      
      if (subtotal > 0) {
        if (subtotal < (Config.FREE_DELIVERY_THRESHOLD || 50)) {
          charge = Config.STANDARD_DELIVERY_CHARGE || 5;
        }
      }
      
      dispatch(setDeliveryCharge(charge));
    } catch (error) {
      console.error('Error calculating delivery charges:', error);
    }
  }, [dispatch, subtotal]);

  const checkItemsAvailability = useCallback(async () => {
    try {
      if (items.length === 0) return;
      
      const productIds = items.map((item: CartItem) => item.product.id);
      const response = await cartService.checkItemsAvailability(productIds);
      
      // Update item availability in store
      response.data?.forEach(({productId, isAvailable}: any) => {
        console.log(`Product ${productId} availability: ${isAvailable}`);
      });
    } catch (error) {
      console.error('Error checking items availability:', error);
    }
  }, [items]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = items.find((item: CartItem) => item.product.id === productId);
    return item ? item.quantity : 0;
  }, [items]);

  const isItemInCart = useCallback((productId: string) => {
    return items.some((item: CartItem) => item.product.id === productId);
  }, [items]);

  return {
    // State
    items,
    appliedCoupon,
    subtotal,
    deliveryCharge,
    discount,
    vatAmount,
    total,
    itemCount,
    loading: isLoading,
    error,
    
    // Actions
    addItem,
    removeItem,
    removeMultipleItems,
    updateItemQuantity,
    clearAllItems,
    applyCoupon,
    removeCouponCode,
    syncCart,
    checkItemsAvailability,
    
    // Utils
    getItemQuantity,
    isItemInCart,
  };
};

// Export the enhanced version as well for backwards compatibility
export const useCartEnhanced = useCart;

// Default export to satisfy Expo Router (even though this is not a route)
export default function CartRouteNotFound() {
  return null;
}
