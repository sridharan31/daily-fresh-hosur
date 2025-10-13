import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Config from '../../../src/config/environment';
import cartService from '../../services/api/cartService';
import priceCalculator from '../../services/business/priceCalculator';
import { CartItem, CartState, Coupon } from '../../types/cart';
import { Product } from '../../types/product';

// Helper function to recalculate cart totals
const recalculateCartTotals = (state: CartState) => {
  state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
  state.subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Calculate delivery charge
  const isFreeDeliveryEligible = state.subtotal >= Config.FREE_DELIVERY_THRESHOLD;
  state.deliveryCharge = isFreeDeliveryEligible ? 0 : Config.STANDARD_DELIVERY_CHARGE;
  
  // Calculate VAT
  state.vatAmount = priceCalculator.calculateVAT(state.subtotal - state.discount);
  
  // Calculate total
  state.total = state.subtotal - state.discount + state.deliveryCharge + state.vatAmount;
  state.totalAmount = state.total; // Keep both for backward compatibility
};

interface AddToCartPayload {
  productId: string;
  quantity: number;
}

interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
  totalAmount: number;
  discount: number;
  coupon: Coupon | null;
}

// Async thunks with proper error handling and type safety
export const fetchCart = createAsyncThunk<CartItem[], void>(
  'cart/fetchCart',
  async (_, {rejectWithValue}) => {
    try {
      const response = await cartService.getCart();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCart = createAsyncThunk<CartItem, AddToCartPayload>(
  'cart/addToCart',
  async ({productId, quantity}, {rejectWithValue}) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      if (!response.data) {
        throw new Error('Failed to add item to cart');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk<CartItem, UpdateCartItemPayload>(
  'cart/updateCartItem',
  async ({itemId, quantity}, {rejectWithValue}) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      if (!response.data) {
        throw new Error('Failed to update cart item');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk<string, string>(
  'cart/removeFromCart',
  async (itemId, {rejectWithValue}) => {
    try {
      await cartService.removeFromCart(itemId);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyCouponCode = createAsyncThunk<Coupon, string>(
  'cart/applyCoupon',
  async (couponCode, {rejectWithValue}) => {
    try {
      const response = await cartService.applyCoupon(couponCode);
      if (!response.data) {
        throw new Error('Failed to apply coupon');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const syncCartWithServer = createAsyncThunk<CartResponse, void>(
  'cart/sync',
  async (_, {rejectWithValue}) => {
    try {
      const response = await cartService.getCart();
      const items = response.data || [];
      const totalAmount = items.reduce((total, item) => total + item.totalPrice, 0);
      
      return {
        items,
        totalAmount,
        discount: 0,
        coupon: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  deliveryCharge: 0,
  vatAmount: 0,
  total: 0,
  totalAmount: 0,
  appliedCoupon: null,
  coupon: null,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.discount = 0;
      state.coupon = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateQuantity: (state, action: PayloadAction<{itemId: string; quantity: number}>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
        item.totalPrice = item.price * action.payload.quantity;
        // Recalculate total
        state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
      }
    },
    addLocalItem: (state, action: PayloadAction<{product: Product; quantity: number}>) => {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        const newItem: CartItem = {
          id: `temp-${Date.now()}`,
          productId: action.payload.product.id,
          name: action.payload.product.name,
          image: action.payload.product.images[0] || '',
          unit: action.payload.product.unit,
          product: action.payload.product,
          quantity: action.payload.quantity,
          price: action.payload.product.price,
          discountedPrice: action.payload.product.originalPrice && action.payload.product.originalPrice > action.payload.product.price 
            ? action.payload.product.price 
            : undefined,
          maxQuantity: action.payload.product.stock,
          isAvailable: action.payload.product.isActive && action.payload.product.stock > 0,
          totalPrice: action.payload.product.price * action.payload.quantity,
        };
        state.items.push(newItem);
      }
      recalculateCartTotals(state);
    },
    removeLocalItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      recalculateCartTotals(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.appliedCoupon = null;
      state.discount = 0;
      recalculateCartTotals(state);
    },
    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
      state.appliedCoupon = action.payload;
      // Calculate discount based on coupon
      if (action.payload.type === 'percentage') {
        state.discount = Math.min(
          (state.subtotal * action.payload.value) / 100,
          action.payload.maxDiscount || state.subtotal
        );
      } else {
        state.discount = Math.min(action.payload.value, state.subtotal);
      }
      recalculateCartTotals(state);
    },
    setDeliveryCharge: (state, action: PayloadAction<number>) => {
      state.deliveryCharge = action.payload;
      recalculateCartTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
        if (existingItem) {
          existingItem.quantity = action.payload.quantity;
          existingItem.totalPrice = action.payload.totalPrice;
        } else {
          state.items.push(action.payload);
        }
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apply Coupon
      .addCase(applyCouponCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCouponCode.fulfilled, (state, action) => {
        state.coupon = action.payload;
        state.appliedCoupon = action.payload;
        // Apply discount logic here if needed
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(applyCouponCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sync Cart
      .addCase(syncCartWithServer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
        state.discount = action.payload.discount;
        state.coupon = action.payload.coupon;
        state.appliedCoupon = action.payload.coupon;
        recalculateCartTotals(state);
        state.isLoading = false;
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCart, 
  clearError, 
  updateQuantity, 
  addLocalItem, 
  removeLocalItem, 
  removeCoupon,
  setDeliveryCharge,
} = cartSlice.actions;

export default cartSlice.reducer;
