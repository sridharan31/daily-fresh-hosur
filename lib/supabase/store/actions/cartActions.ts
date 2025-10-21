import { createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cart';

// Fetch user's cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      const cartItems = await cartService.getCartItems(userId);
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart items');
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, productId, quantity }: { userId: string; productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await cartService.addToCart(userId, productId, quantity);
      const cartItems = await cartService.getCartItems(userId);
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

// Update cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ userId, cartItemId, quantity }: { userId: string; cartItemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await cartService.updateCartItemQuantity(cartItemId, quantity);
      const cartItems = await cartService.getCartItems(userId);
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update cart item quantity');
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, cartItemId }: { userId: string; cartItemId: string }, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(cartItemId);
      const cartItems = await cartService.getCartItems(userId);
      return cartItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      await cartService.clearCart(userId);
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);