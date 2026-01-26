import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { couponService } from '../../lib/services/business/couponService';
import { AppDispatch } from '../../lib/supabase/store';
import {
  addToCart,
  clearCart,
  fetchCart,
  removeFromCart,
  updateCartItemQuantity
} from '../../lib/supabase/store/actions/cartActions';
import { removeCoupon, setCoupon, setDiscount } from '../../lib/supabase/store/cartSlice';
import { RootState } from '../../lib/supabase/store/rootReducer';
import { Product } from '../../lib/types/product';
import Config from '../config/environment';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Get cart state from Supabase store
  const { items = [], isLoading, error, coupon, discount } = useSelector((state: RootState) => state.cart);
  
  // Make sure items is always an array
  const safeItems = items || [];
  
  // Calculate cart totals
  const subtotal = safeItems.reduce((total, item) => {
    // Use product price if available, multiply by quantity
    const itemPrice = item.price || (item.product && item.product.price) || 0;
    const itemQuantity = item.quantity || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
  
  const itemCount = safeItems.reduce((count, item) => count + (item.quantity || 0), 0);
  
  // Calculate valid discount
  let calculatedDiscount = discount || 0;
  if (coupon) {
    calculatedDiscount = couponService.calculateDiscount(coupon, subtotal);
  }
  
  const discountedSubtotal = Math.max(0, subtotal - calculatedDiscount);
  
  const deliveryCharge = discountedSubtotal > (Config.FREE_DELIVERY_THRESHOLD || 500) ? 0 : (Config.STANDARD_DELIVERY_CHARGE || 25);
  const vatAmount = discountedSubtotal * 0.05; // 5% VAT on discounted amount (or original, depends on policy)
  const total = discountedSubtotal + deliveryCharge + vatAmount;
  
  // Add a product to the cart
  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    if (!product) return;
    
    try {
      if (isAuthenticated && user) {
        // Add to server cart if user is authenticated
        await dispatch(addToCart({
          userId: user.id,
          productId: product.id,
          quantity
        }));
      } else {
        // For non-authenticated users, directly modify the local cart state
        // This is a temporary workaround until we implement local cart storage
        // Find if product already exists in cart
        const existingItemIndex = safeItems.findIndex(
          item => item.product?.id === product.id
        );

        if (existingItemIndex !== -1) {
          // Update existing item quantity
          const updatedItems = [...safeItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          
          // Dispatch a "fake" cart update action to update the state
          dispatch({ 
            type: 'cart/addToCart/fulfilled', 
            payload: updatedItems 
          });
        } else {
          // Add new item to cart
          const newItem = {
            id: `local-${Date.now()}`,
            product_id: product.id,
            user_id: 'guest',
            quantity: quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: product
          };
          
          // Dispatch a "fake" cart update action to update the state
          dispatch({ 
            type: 'cart/addToCart/fulfilled', 
            payload: [...safeItems, newItem] 
          });
        }
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, [dispatch, isAuthenticated, user, safeItems]);
  
  // Remove an item from the cart
  const removeItem = useCallback(async (cartItemId: string) => {
    if (!cartItemId) return;
    
    try {
      if (isAuthenticated && user) {
        await dispatch(removeFromCart({
          userId: user.id,
          cartItemId
        }));
      } else {
        // For non-authenticated users, directly modify the local cart state
        const updatedItems = safeItems.filter(item => item.id !== cartItemId);
        
        // Dispatch a "fake" cart update action
        dispatch({ 
          type: 'cart/removeFromCart/fulfilled', 
          payload: updatedItems 
        });
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  }, [dispatch, isAuthenticated, user, safeItems]);
  
  // Update item quantity in the cart
  const updateItemQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!cartItemId || quantity < 1) return;
    
    try {
      if (isAuthenticated && user) {
        await dispatch(updateCartItemQuantity({
          userId: user.id,
          cartItemId,
          quantity
        }));
      } else {
        // For non-authenticated users, directly modify the local cart state
        const updatedItems = safeItems.map(item => {
          if (item.id === cartItemId) {
            return { ...item, quantity };
          }
          return item;
        });
        
        // Dispatch a "fake" cart update action
        dispatch({ 
          type: 'cart/updateCartItemQuantity/fulfilled', 
          payload: updatedItems 
        });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  }, [dispatch, isAuthenticated, user, safeItems]);
  
  // Clear the entire cart
  const clearAllItems = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await dispatch(clearCart(user.id));
      } else {
        // For non-authenticated users, clear the local cart state
        dispatch({ 
          type: 'cart/clearCart/fulfilled', 
          payload: [] 
        });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Refresh cart from server
  const refreshCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await dispatch(fetchCart(user.id));
      } catch (error) {
        console.error('Failed to refresh cart:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Utility functions for component compatibility
  const getItemQuantity = useCallback((productId: string) => {
    const item = safeItems.find(item => item.product?.id === productId);
    return item ? item.quantity : 0;
  }, [safeItems]);

  const isItemInCart = useCallback((productId: string) => {
    return safeItems.some(item => item.product?.id === productId);
  }, [safeItems]);
  
  const syncCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await dispatch(fetchCart(user.id));
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);

  const applyCoupon = useCallback(async (code: string) => {
    if (!code) return;
    
    // Calculate subtotal inside
    const currentSubtotal = safeItems.reduce((total, item) => {
      if (item.product && typeof item.product.price === 'number') {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);

    const result = await couponService.validateCoupon(code, currentSubtotal);
    
    if (result.valid && result.coupon) {
      const discountAmount = couponService.calculateDiscount(result.coupon, currentSubtotal);
      dispatch(setCoupon(result.coupon));
      dispatch(setDiscount(discountAmount));
      return result.coupon;
    } else {
      throw new Error(result.error || 'Invalid coupon');
    }
  }, [dispatch, safeItems]);

  const removeCouponCode = useCallback(async () => {
    dispatch(removeCoupon());
  }, [dispatch]);

  // Use the discount from state (which is synched with coupon)
  const appliedCoupon = coupon;

  return {
    // State
    items: safeItems,
    rawItems: safeItems,
    subtotal,
    itemCount,
    isLoading,
    error,
    deliveryCharge,
    vatAmount,
    total,
    discount: calculatedDiscount,
    appliedCoupon,
    loading: isLoading,
    
    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    clearAllItems,
    refreshCart,
    syncCart,
    applyCoupon,
    removeCouponCode,
    
    // Utils
    getItemQuantity,
    isItemInCart,
    
    // Compatibility
    emptyCart: clearAllItems,
    updateItem: updateItemQuantity,
    cartItemCount: itemCount
  };
};

export const useCartEnhanced = useCart;
export default useCart;
