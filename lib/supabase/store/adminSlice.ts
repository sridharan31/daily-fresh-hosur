import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { adminSupabaseService } from '../../services/adminSupabaseService';
import {
    AdminAnalytics,
    AdminCustomer,
    AdminDashboardData,
    AdminOrder,
    AdminProduct,
} from '../../types/admin';
import { AdminRole, AdminUserWithRole } from '../../types/adminRoles';
import { ProductCategory } from '../../types/product';
import {
    createAdminProduct,
    deleteAdminProduct,
    fetchAdminLowStockProducts,
    fetchAdminOrderById,
    fetchAdminOrders,
    fetchAdminProductById,
    fetchAdminProducts,
    fetchAdminTopSellingProducts,
    updateAdminOrderStatus,
    updateAdminProduct,
    updateAdminProductStatus
} from './actions/adminActions';
import {
    createAdminUser,
    deleteAdminUser,
    fetchAdminRoles,
    fetchAdminUsers,
    setCurrentAdminUser,
    updateAdminUser
} from './actions/adminUserActions';

// Initial state with proper typing
interface AdminState {
  dashboardData: AdminDashboardData | null;
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  analytics: AdminAnalytics | null;
  categories: ProductCategory[];
  adminUsers: AdminUserWithRole[];
  currentUser: AdminUserWithRole | null;
  availableRoles: AdminRole[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  selectedOrderId: string | null;
  selectedProduct: AdminProduct | null;
  deliverySlots: any[];
}

const initialState: AdminState = {
  dashboardData: null,
  products: [],
  orders: [],
  customers: [],
  analytics: null,
  categories: [],
  adminUsers: [],
  currentUser: null,
  availableRoles: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  selectedOrderId: null,
  selectedProduct: null,
  deliverySlots: [],
};

// Create default dashboard data for initial state
export const createDefaultDashboardData = (): AdminDashboardData => ({
  orders: {
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    todayOrders: 0,
  },
  revenue: {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  },
  users: {
    total: 0,
    active: 0,
    new: 0,
  },
  products: {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  },
  orderStatus: {
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  },
  salesTrend: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [0, 0, 0, 0, 0, 0, 0],
  },
  topProducts: {
    labels: ['Product 1', 'Product 2', 'Product 3'],
    data: [0, 0, 0],
  },
  todayStats: {
    orders: 0,
    revenue: 0,
  },
  activeCustomers: 0,
  lowStockItems: 0,
  pendingOrders: 0,
  recentOrders: [],
});

// Async thunks
export const fetchDashboardData = createAsyncThunk<
  AdminDashboardData,
  string,
  {rejectValue: string}
>(
  'admin/fetchDashboardData',
  async (period = 'today', {rejectWithValue}) => {
    try {
      // Try to fetch data from Supabase
      try {
        const data = await adminSupabaseService.getDashboardData(period);
        return data;
      } catch (error) {
        // If Supabase service fails, return default data
        console.error('Failed to fetch dashboard data from Supabase:', error);
        return createDefaultDashboardData();
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOrderId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<AdminProduct | null>) => {
      state.selectedProduct = action.payload;
    },
    // You can add more reducers here as needed
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardData
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
        // Provide default data in case of error
        state.dashboardData = createDefaultDashboardData();
      })
      
      // Product Management
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      
      .addCase(fetchAdminProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchAdminProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product details';
      })
      
      .addCase(createAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = [action.payload, ...state.products];
        state.selectedProduct = action.payload;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create product';
      })
      
      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        );
        state.selectedProduct = action.payload;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      })
      
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product.id !== action.payload);
        if (state.selectedProduct && state.selectedProduct.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      })
      
      .addCase(updateAdminProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        );
        if (state.selectedProduct && state.selectedProduct.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateAdminProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product status';
      })
      
      // Order Management
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      
      .addCase(fetchAdminOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
        state.loading = false;
        // Store the selected order in a new state property
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order details';
      })
      
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update order status';
      })
      
      // Admin User Management
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin users';
      })
      
      .addCase(fetchAdminRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRoles = action.payload;
      })
      .addCase(fetchAdminRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin roles';
      })
      
      .addCase(createAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = [action.payload, ...state.adminUsers];
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create admin user';
      })
      
      .addCase(updateAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = state.adminUsers.map(user =>
          user.id === action.payload.id ? action.payload : user
        );
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update admin user';
      })
      
      .addCase(deleteAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = state.adminUsers.filter(user => user.id !== action.payload);
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete admin user';
      })
      
      .addCase(setCurrentAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setCurrentAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(setCurrentAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set current admin user';
      })
      
      // Analytics
      .addCase(fetchAdminTopSellingProducts.fulfilled, (state, action) => {
        if (state.dashboardData) {
          // Transform AdminProduct[] to chart data structure
          const products = action.payload.slice(0, 5); // Take top 5
          state.dashboardData.topProducts = {
            labels: products.map(p => p.name.substring(0, 10) + (p.name.length > 10 ? '...' : '')),
            data: products.map(p => p.totalSold || 0)
          };
        }
      })
      .addCase(fetchAdminLowStockProducts.fulfilled, (state, action) => {
        // You could store low stock products in a dedicated state property
        // state.lowStockProducts = action.payload;
      })
  },
});

export const { clearError, setSelectedOrderId, setSelectedProduct } = adminSlice.actions;
export default adminSlice.reducer;