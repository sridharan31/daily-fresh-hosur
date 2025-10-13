import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import orderService from '../../services/api/orderService';
import {
  CancelOrderRequest,
  CreateOrderRequest,
  Order,
  OrderState,
  OrderStatus
} from '../../types/order';

// Async thunks
export const createOrder = createAsyncThunk<
  {order: Order; paymentClientSecret?: string},
  CreateOrderRequest,
  {rejectValue: string}
>(
  'order/createOrder',
  async (orderData, {rejectWithValue}) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk<
  {orders: Order[]; pagination: any},
  {page?: number; limit?: number; status?: OrderStatus[]},
  {rejectValue: string}
>(
  'order/fetchOrders',
  async (params, {rejectWithValue}) => {
    try {
      const response = await orderService.getOrderHistory(params || {});
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk<
  Order,
  string,
  {rejectValue: string}
>(
  'order/fetchOrderDetails',
  async (orderId, {rejectWithValue}) => {
    try {
      const response = await orderService.getOrderDetails(orderId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const cancelOrder = createAsyncThunk<
  {order: Order; refundAmount: number},
  {orderId: string; reason: string},
  {rejectValue: string}
>(
  'order/cancelOrder',
  async ({orderId, reason}, {rejectWithValue}) => {
    try {
      const cancelData: CancelOrderRequest = { reason };
      const response = await orderService.cancelOrder(orderId, cancelData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

export const trackOrder = createAsyncThunk<
  any, // Use any for now to avoid type conflicts between different OrderTrackingInfo definitions
  string,
  {rejectValue: string}
>(
  'order/trackOrder',
  async (orderId, {rejectWithValue}) => {
    try {
      const response = await orderService.trackOrder(orderId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to track order');
    }
  }
);

export const reorderItems = createAsyncThunk<
  {cartItemsAdded: number; unavailableItems: string[]},
  string,
  {rejectValue: string}
>(
  'order/reorderItems',
  async (orderId, {rejectWithValue}) => {
    try {
      const response = await orderService.reorder(orderId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reorder items');
    }
  }
);

// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  orderTracking: null,
  isLoading: false,
  creating: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
  },
};

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrderTracking: (state) => {
      state.orderTracking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOrderStatus: (state, action: PayloadAction<{orderId: string; status: OrderStatus}>) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
      }
    },
    setOrderFilter: (state, action: PayloadAction<{status?: OrderStatus[]; page?: number}>) => {
      // This could be used to store filter state if needed
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create order';
      })
      
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        
        // Update the order in the orders array if it exists
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch order details';
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const cancelledOrder = action.payload.order;
        
        // Update current order
        if (state.currentOrder?.id === cancelledOrder.id) {
          state.currentOrder = cancelledOrder;
        }
        
        // Update order in orders array
        const orderIndex = state.orders.findIndex(order => order.id === cancelledOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = cancelledOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to cancel order';
      })
      
      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderTracking = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to track order';
      })
      
      // Reorder items
      .addCase(reorderItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderItems.fulfilled, (state) => {
        state.isLoading = false;
        // Success is usually handled by cart slice or showing a success message
      })
      .addCase(reorderItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reorder items';
      });
  },
});

export const {
  clearCurrentOrder,
  clearOrderTracking,
  clearError,
  updateOrderStatus,
  setOrderFilter,
} = orderSlice.actions;

export default orderSlice.reducer;
