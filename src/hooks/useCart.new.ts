import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../lib/supabase/store';
import {
  addToCart,
  clearCart,
  fetchCart,
  removeFromCart,
  updateCartItemQuantity
} from '../../lib/supabase/store/actions/cartActions';
import { RootState } from '../../lib/supabase/store/rootReducer';
import { Product } from '../../lib/types/product';
import Config from '../config/environment';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Get cart state from Supabase store
  const { items = [], isLoading, error } = useSelector((state: RootState) => state.cart);
  
  // Make sure items is always an array
  const safeItems = items || [];
  
  // Calculate cart totals
  const subtotal = safeItems.reduce((total, item) => {
    // Use product price if available, multiply by quantity
    if (item.product && typeof item.product.price === 'number') {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);
  
  const itemCount = safeItems.reduce((count, item) => count + item.quantity, 0);
  const deliveryCharge = subtotal > Config.FREE_DELIVERY_THRESHOLD || 50 ? 0 : Config.STANDARD_DELIVERY_CHARGE || 5;
  const vatAmount = subtotal * 0.05; // 5% VAT
  const total = subtotal + deliveryCharge + vatAmount;
  
  // Add a product to the cart
  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    if (!product) return;
    
    if (isAuthenticated && user) {
      // Add to server cart if user is authenticated
      try {
        await dispatch(addToCart({
          userId: user.id,
          productId: product.id,
          quantity
        }));
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Remove an item from the cart
  const removeItem = useCallback(async (cartItemId: string) => {
    if (!cartItemId) return;
    
    if (isAuthenticated && user) {
      try {
        await dispatch(removeFromCart({
          userId: user.id,
          cartItemId
        }));
      } catch (error) {
        console.error('Failed to remove item from cart:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Update item quantity in the cart
  const updateItem = useCallback(async (cartItemId: string, quantity: number) => {
    if (!cartItemId || quantity < 1) return;
    
    if (isAuthenticated && user) {
      try {
        await dispatch(updateCartItemQuantity({
          userId: user.id,
          cartItemId,
          quantity
        }));
      } catch (error) {
        console.error('Failed to update cart item:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Clear the entire cart
  const emptyCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await dispatch(clearCart(user.id));
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
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
  
  return {
    items: safeItems,
    subtotal,
    itemCount,
    isLoading,
    error,
    deliveryCharge,
    vatAmount,
    total,
    addItem,
    removeItem,
    updateItem,
    emptyCart,
    refreshCart
  };
};

export default useCart;