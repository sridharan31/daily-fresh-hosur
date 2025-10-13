import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import orderService from '../../services/api/orderService';
import { ApiResponse } from '../../types/api';
import { Order, OrderState, OrderStatus, OrderTrackingInfo, CreateOrderRequest, CancelOrderRequest } from '../../types/order';

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

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  {rejectValue: string}
>(
  'order/fetchOrderById',
  async (orderId, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Order> = await orderService.getOrderById(orderId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk<
  Order,
  {orderId: string; reason: string},
  {rejectValue: string}
>(
  'order/cancelOrder',
  async ({orderId, reason}, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Order> = await orderService.cancelOrder(orderId, reason);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

export const trackOrder = createAsyncThunk<
  {orderId: string; status: OrderStatus; location?: any},
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

// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  orderTracking: null,
  loading: false,
  creating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
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
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status;
      }
    },
    addRealtimeOrderUpdate: (state, action: PayloadAction<Order>) => {
      const existingOrderIndex = state.orders.findIndex(o => o.id === action.payload.id);
      if (existingOrderIndex >= 0) {
        state.orders[existingOrderIndex] = action.payload;
      } else {
        state.orders.unshift(action.payload);
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
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
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create order';
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order';
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const orderIndex = state.orders.findIndex(o => o.id === action.payload.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      // Track order
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.orderTracking = action.payload;
      });
  },
});

export const {
  clearCurrentOrder,
  clearOrderTracking,
  clearError,
  updateOrderStatus,
  addRealtimeOrderUpdate,
} = orderSlice.actions;

export default orderSlice.reducer;