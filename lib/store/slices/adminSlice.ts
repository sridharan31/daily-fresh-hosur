import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import adminService from '../../services/api/adminService';
import {
  AdminAnalytics,
  AdminCustomer,
  AdminDashboardData,
  AdminOrder,
  AdminProduct,
  AdminState,
} from '../../types/admin';
import { ApiResponse } from '../../types/api';
import { DeliverySlot } from '../../types/delivery';
import { OrderStatus } from '../../types/order';
import { Product, ProductCategory } from '../../types/product';

// Async thunks
export const fetchDashboardData = createAsyncThunk<
  AdminDashboardData,
  string,
  {rejectValue: string}
>(
  'admin/fetchDashboardData',
  async (period = 'today', {rejectWithValue}) => {
    try {
      const response = await adminService.getDashboardData(period);
      const data = response.data!;
      
      // Transform DashboardData to AdminDashboardData
      const adminData: AdminDashboardData = {
        ...data,
        todayStats: {
          orders: data.orders.todayOrders || 0,
          revenue: data.revenue.today || 0,
        },
        activeCustomers: data.users.active || 0,
        lowStockItems: data.products.lowStock || 0,
        pendingOrders: data.orders.pending || 0,
        recentOrders: [], // This would need to be fetched separately or included in the API
      };
      
      return adminData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk<
  AdminOrder[],
  {page?: number; status?: string; dateRange?: {from: string; to: string}},
  {rejectValue: string}
>(
  'admin/fetchAdminOrders',
  async (params, {rejectWithValue}) => {
    try {
      const response = await adminService.getOrders(params);
      // Transform Order[] to AdminOrder[]
      const adminOrders: AdminOrder[] = response.data!.orders.map(order => ({
        ...order,
        customerName: 'Customer', // In real app, this would come from user lookup
        customerEmail: 'customer@example.com',
        customerPhone: '+1234567890',
        lastStatusUpdate: order.updatedAt,
        total: order.finalAmount, // Add the missing total property
      }));
      return adminOrders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchAdminProducts = createAsyncThunk<
  AdminProduct[],
  {page?: number; category?: string; status?: string},
  {rejectValue: string}
>(
  'admin/fetchAdminProducts',
  async (params, {rejectWithValue}) => {
    try {
      const response = await adminService.getProducts(params);
      // Transform Product[] to AdminProduct[]
      const adminProducts: AdminProduct[] = response.data!.products.map(product => ({
        ...product,
        totalSold: 0, // In real app, this would come from analytics
        revenue: 0,
        lastRestocked: new Date().toISOString(),
        costPrice: product.price * 0.7, // Example calculation
        profitMargin: 30,
        views: 0,
        conversions: 0,
      }));
      return adminProducts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchAdminCustomers = createAsyncThunk<
  AdminCustomer[],
  {page?: number; searchTerm?: string},
  {rejectValue: string}
>(
  'admin/fetchAdminCustomers',
  async (params, {rejectWithValue}) => {
    try {
      const response = await adminService.getCustomers(params);
      // Transform User[] to AdminCustomer[]
      const adminCustomers: AdminCustomer[] = response.data!.customers.map(user => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`, // Combine first and last name
        totalOrders: 0, // In real app, this would come from analytics
        totalSpent: 0,
        averageOrderValue: 0,
        loyaltyPoints: 0,
        registrationSource: 'web',
        segment: 'new' as const,
        isActive: true, // Default active status
      }));
      return adminCustomers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const fetchAnalytics = createAsyncThunk<
  AdminAnalytics,
  {dateRange: {from: string; to: string}; type: 'sales' | 'customers' | 'products'},
  {rejectValue: string}
>(
  'admin/fetchAnalytics',
  async (params, {rejectWithValue}) => {
    try {
      const response: ApiResponse<AdminAnalytics> = await adminService.getAnalytics(params);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  AdminOrder,
  {orderId: string; status: OrderStatus; notes?: string},
  {rejectValue: string}
>(
  'admin/updateOrderStatus',
  async ({orderId, status, notes}, {rejectWithValue}) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, status, notes);
      // Transform Order to AdminOrder
      const adminOrder: AdminOrder = {
        ...response.data!,
        customerName: 'Customer', // In real app, this would come from user lookup
        customerEmail: 'customer@example.com',
        customerPhone: '+1234567890',
        lastStatusUpdate: new Date().toISOString(),
        total: response.data!.finalAmount,
      };
      return adminOrder;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const updateProductStatus = createAsyncThunk<
  AdminProduct,
  {productId: string; isActive: boolean},
  {rejectValue: string}
>(
  'admin/updateProductStatus',
  async ({productId, isActive}, {rejectWithValue}) => {
    try {
      const response = await adminService.updateProductStatus(productId, isActive);
      // Transform Product to AdminProduct
      const adminProduct: AdminProduct = {
        ...response.data!,
        totalSold: 0, // In real app, this would come from analytics
        revenue: 0,
        lastRestocked: new Date().toISOString(),
        costPrice: response.data!.price * 0.7,
        profitMargin: 30,
        views: 0,
        conversions: 0,
      };
      return adminProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product status');
    }
  }
);

// Delivery Slot Management Thunks
export const fetchDeliverySlots = createAsyncThunk<
  DeliverySlot[],
  { date?: string; area?: string },
  { rejectValue: string }
>(
  'admin/fetchDeliverySlots',
  async (params, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from API
      const mockSlots: DeliverySlot[] = [
        {
          id: '1',
          date: '2024-01-15',
          time: '09:00 - 11:00',
          capacity: 20,
          bookedCount: 15,
          charge: 50,
          available: true,
          type: 'morning',
          estimatedDelivery: '10:00'
        },
        {
          id: '2',
          date: '2024-01-15',
          time: '14:00 - 16:00',
          capacity: 25,
          bookedCount: 8,
          charge: 30,
          available: true,
          type: 'evening',
          estimatedDelivery: '15:00'
        }
      ];
      
      return mockSlots;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch delivery slots');
    }
  }
);

export const createDeliverySlot = createAsyncThunk<
  DeliverySlot,
  Partial<DeliverySlot>,
  { rejectValue: string }
>(
  'admin/createDeliverySlot',
  async (slotData, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSlot: DeliverySlot = {
        id: Date.now().toString(),
        bookedCount: 0,
        available: true,
        type: 'morning',
        estimatedDelivery: '10:00',
        ...slotData,
        date: slotData.date!,
        time: slotData.time!,
        capacity: slotData.capacity!,
        charge: slotData.charge!,
      };
      
      return newSlot;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create delivery slot');
    }
  }
);

export const updateDeliverySlot = createAsyncThunk<
  DeliverySlot,
  { id: string; updates: Partial<DeliverySlot> },
  { rejectValue: string }
>(
  'admin/updateDeliverySlot',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call and return updated slot
      const updatedSlot: DeliverySlot = {
        id,
        date: '2024-01-15',
        time: '09:00 - 11:00',
        capacity: 20,
        bookedCount: 15,
        charge: 50,
        available: true,
        type: 'morning',
        estimatedDelivery: '10:00',
        ...updates,
      };
      
      return updatedSlot;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update delivery slot');
    }
  }
);

export const deleteDeliverySlot = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'admin/deleteDeliverySlot',
  async (slotId, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return slotId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete delivery slot');
    }
  }
);

export const getSlotUtilization = createAsyncThunk<
  { slotId: string; utilization: number }[],
  { dateRange: string; area?: string },
  { rejectValue: string }
>(
  'admin/getSlotUtilization',
  async (params, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock utilization data
      return [
        { slotId: '1', utilization: 75 },
        { slotId: '2', utilization: 32 },
      ];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get slot utilization');
    }
  }
);

// Product Management Thunks
export const addProduct = createAsyncThunk<
  AdminProduct,
  Partial<Product>,
  { rejectValue: string }
>(
  'admin/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProduct: AdminProduct = {
        id: Date.now().toString(),
        name: productData.name!,
        description: productData.description || '',
        price: productData.price!,
        originalPrice: productData.price!,
        unit: productData.unit!,
        category: productData.category!,
        subCategory: productData.subCategory || '',
        images: productData.images || [],
        stock: productData.stock || 0,
        isOrganic: productData.isOrganic || false,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        tags: [],
        nutritionalInfo: productData.nutritionalInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Admin-specific properties
        totalSold: 0,
        revenue: 0,
        lastRestocked: new Date().toISOString(),
        supplier: 'Default Supplier',
        costPrice: productData.price! * 0.7,
        profitMargin: 30,
        views: 0,
        conversions: 0,
      };
      
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk<
  AdminProduct,
  { id: string; updates: Partial<Product> },
  { rejectValue: string }
>(
  'admin/updateProduct',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would make an API call and return updated product
      const defaultCategory: ProductCategory = {
        id: 'cat1',
        name: 'Vegetables',
        image: '',
        isActive: true
      };
      
      const updatedProduct: AdminProduct = {
        id,
        name: updates.name || 'Updated Product',
        description: updates.description || '',
        price: updates.price || 0,
        originalPrice: updates.price || 0,
        unit: updates.unit || 'kg',
        category: updates.category || defaultCategory,
        subCategory: updates.subCategory || '',
        images: updates.images || [],
        stock: updates.stock || 0,
        isOrganic: updates.isOrganic || false,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        tags: [],
        nutritionalInfo: updates.nutritionalInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Admin-specific properties
        totalSold: 0,
        revenue: 0,
        lastRestocked: new Date().toISOString(),
        supplier: 'Default Supplier',
        costPrice: (updates.price || 0) * 0.7,
        profitMargin: 30,
        views: 0,
        conversions: 0,
      };
      
      return updatedProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const bulkUploadProducts = createAsyncThunk<
  AdminProduct[],
  any, // File object
  { rejectValue: string }
>(
  'admin/bulkUploadProducts',
  async (file, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock processed products from CSV
      const defaultCategory: ProductCategory = {
        id: 'cat1',
        name: 'Vegetables',
        image: '',
        isActive: true
      };
      
      const mockProducts: AdminProduct[] = [
        {
          id: 'bulk1',
          name: 'Bulk Product 1',
          description: 'Uploaded via CSV',
          price: 50,
          originalPrice: 50,
          unit: 'kg',
          category: defaultCategory,
          subCategory: 'leafy',
          images: [],
          stock: 100,
          isOrganic: true,
          isActive: true,
          rating: 0,
          reviewCount: 0,
          tags: [],
          nutritionalInfo: {
            calories: 25,
            protein: 2.9,
            carbs: 4.5,
            fat: 0.3,
            fiber: 2.9
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalSold: 0,
          revenue: 0,
          lastRestocked: new Date().toISOString(),
          supplier: 'Bulk Supplier',
          costPrice: 35,
          profitMargin: 30,
          views: 0,
          conversions: 0,
        }
      ];
      
      return mockProducts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to bulk upload products');
    }
  }
);

// Initial state
const initialState: AdminState = {
  dashboardData: null,
  orders: [],
  products: [],
  customers: [],
  deliverySlots: [],
  analytics: null,
  loading: false,
  ordersLoading: false,
  productsLoading: false,
  customersLoading: false,
  deliverySlotsLoading: false,
  analyticsLoading: false,
  error: null,
  selectedDateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    to: new Date().toISOString(),
  },
  filters: {
    orderStatus: 'all',
    productCategory: 'all',
    customerSegment: 'all',
  },
};

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{from: string; to: string}>) => {
      state.selectedDateRange = action.payload;
    },
    setOrderFilter: (state, action: PayloadAction<string>) => {
      state.filters.orderStatus = action.payload;
    },
    setProductFilter: (state, action: PayloadAction<string>) => {
      state.filters.productCategory = action.payload;
    },
    setCustomerFilter: (state, action: PayloadAction<string>) => {
      state.filters.customerSegment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.dashboardData = null;
      state.analytics = null;
    },
    updateOrderInList: (state, action: PayloadAction<AdminOrder>) => {
      const index = state.orders.findIndex((order: AdminOrder) => order.id === action.payload.id);
      if (index >= 0) {
        state.orders[index] = action.payload;
      }
    },
    updateProductInList: (state, action: PayloadAction<AdminProduct>) => {
      const index = state.products.findIndex((product: AdminProduct) => product.id === action.payload.id);
      if (index >= 0) {
        state.products[index] = action.payload;
      }
    },
    addRealtimeOrder: (state, action: PayloadAction<AdminOrder>) => {
      state.orders.unshift(action.payload);
      if (state.dashboardData) {
        state.dashboardData.todayStats.orders += 1;
        state.dashboardData.todayStats.revenue += action.payload.total;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
      })
      // Fetch admin orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      // Fetch admin products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      // Fetch admin customers
      .addCase(fetchAdminCustomers.pending, (state) => {
        state.customersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customers = action.payload;
      })
      .addCase(fetchAdminCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      })
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload || 'Failed to fetch analytics';
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order: AdminOrder) => order.id === action.payload.id);
        if (index >= 0) {
          state.orders[index] = action.payload;
        }
      })
      // Update product status
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex((product: AdminProduct) => product.id === action.payload.id);
        if (index >= 0) {
          state.products[index] = action.payload;
        }
      })
      // Fetch delivery slots
      .addCase(fetchDeliverySlots.pending, (state) => {
        state.deliverySlotsLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliverySlots.fulfilled, (state, action) => {
        state.deliverySlotsLoading = false;
        state.deliverySlots = action.payload;
      })
      .addCase(fetchDeliverySlots.rejected, (state, action) => {
        state.deliverySlotsLoading = false;
        state.error = action.payload || 'Failed to fetch delivery slots';
      })
      // Create delivery slot
      .addCase(createDeliverySlot.fulfilled, (state, action) => {
        state.deliverySlots.push(action.payload);
      })
      // Update delivery slot
      .addCase(updateDeliverySlot.fulfilled, (state, action) => {
        const index = state.deliverySlots.findIndex(slot => slot.id === action.payload.id);
        if (index !== -1) {
          state.deliverySlots[index] = action.payload;
        }
      })
      // Delete delivery slot
      .addCase(deleteDeliverySlot.fulfilled, (state, action) => {
        state.deliverySlots = state.deliverySlots.filter(slot => slot.id !== action.payload);
      })
      // Get slot utilization
      .addCase(getSlotUtilization.fulfilled, (state, action) => {
        // This could update slots with utilization data or be handled separately
        // For now, we'll just store it in the component state
      })
      // Product management
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload);
      })
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.products.push(...action.payload);
      });
  },
});

export const {
  setDateRange,
  setOrderFilter,
  setProductFilter,
  setCustomerFilter,
  clearError,
  clearDashboardData,
  updateOrderInList,
  updateProductInList,
  addRealtimeOrder,
} = adminSlice.actions;

export default adminSlice.reducer;
