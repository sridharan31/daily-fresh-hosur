import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../lib/supabase/store';
import {
  addToCart,
  clearCart,
  fetchCart,
  removeFromCart
} from '../../lib/supabase/store/actions/cartActions';
import { RootState } from '../../lib/supabase/store/rootReducer';
import { Product } from '../../lib/types/product';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Get cart state from Supabase store
  const { items, isLoading, error } = useSelector((state: RootState) => state.cart);
  
  // Make sure items is always an array
  const safeItems = items || [];
  
  // Calculate cart totals
  const subtotal = safeItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = safeItems.reduce((count, item) => count + item.quantity, 0);
  
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
  const removeItem = useCallback(async (itemId: string) => {
    if (!itemId) return;
    
    if (isAuthenticated && user) {
      try {
        await dispatch(removeFromCart({
          userId: user.id,
          itemId
        }));
      } catch (error) {
        console.error('Failed to remove item from cart:', error);
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Update item quantity in the cart
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!itemId || quantity < 1) return;
    
    if (isAuthenticated && user) {
      try {
        // For now, we'll remove and add again as updateCartItem might not exist
        await dispatch(removeFromCart({
          userId: user.id,
          itemId
        }));
        
        const product = safeItems.find(item => item.id === itemId)?.product;
        if (product) {
          await dispatch(addToCart({
            userId: user.id,
            productId: product.id,
            quantity
          }));
        }
      } catch (error) {
        console.error('Failed to update cart item:', error);
      }
    }
  }, [dispatch, isAuthenticated, user, safeItems]);
  
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
    addItem,
    removeItem,
    updateItem,
    emptyCart,
    refreshCart
  };
};

export default useCart;