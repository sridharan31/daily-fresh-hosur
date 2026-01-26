import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coupon } from '../../services/business/couponService';
import { CartItem } from '../services/cart';
import {
    addToCart,
    clearCart,
    fetchCart,
    removeFromCart,
    updateCartItemQuantity
} from './actions/cartActions';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  coupon: Coupon | null;
  discount: number;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  coupon: null,
  discount: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.coupon = null;
        state.discount = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setCoupon, removeCoupon, setDiscount } = cartSlice.actions;
export default cartSlice.reducer;