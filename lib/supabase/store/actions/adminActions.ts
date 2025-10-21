import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    AdminOrder,
    AdminProduct,
    OrderFilters,
    ProductFilters,
    UpdateOrderStatusRequest,
    UpdateProductStatusRequest
} from '../../../types/admin';
import { adminSupabaseService } from '../../services/adminSupabaseService';

// Product management action thunks
export const fetchAdminProducts = createAsyncThunk<
  { products: AdminProduct[]; totalPages: number },
  ProductFilters | undefined,
  { rejectValue: string }
>(
  'admin/fetchAdminProducts',
  async (filters, { rejectWithValue }) => {
    try {
      const result = await adminSupabaseService.getProducts(filters);
      return {
        products: result.products,
        totalPages: result.totalPages
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchAdminProductById = createAsyncThunk<
  AdminProduct,
  string,
  { rejectValue: string }
>(
  'admin/fetchAdminProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const product = await adminSupabaseService.getProductById(productId);
      if (!product) {
        return rejectWithValue(`Product with ID ${productId} not found`);
      }
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const createAdminProduct = createAsyncThunk<
  AdminProduct,
  Partial<AdminProduct>,
  { rejectValue: string }
>(
  'admin/createAdminProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.createProduct(productData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateAdminProduct = createAsyncThunk<
  AdminProduct,
  { productId: string; updates: Partial<AdminProduct> },
  { rejectValue: string }
>(
  'admin/updateAdminProduct',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.updateProduct(productId, updates);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteAdminProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'admin/deleteAdminProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const success = await adminSupabaseService.deleteProduct(productId);
      if (success) {
        return productId;
      }
      return rejectWithValue(`Failed to delete product with ID ${productId}`);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const updateAdminProductStatus = createAsyncThunk<
  AdminProduct,
  UpdateProductStatusRequest,
  { rejectValue: string }
>(
  'admin/updateAdminProductStatus',
  async (request, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.updateProductStatus(request);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product status');
    }
  }
);

// Order management action thunks
export const fetchAdminOrders = createAsyncThunk<
  { orders: AdminOrder[]; totalPages: number },
  OrderFilters | undefined,
  { rejectValue: string }
>(
  'admin/fetchAdminOrders',
  async (filters, { rejectWithValue }) => {
    try {
      const result = await adminSupabaseService.getOrders(filters);
      return {
        orders: result.orders,
        totalPages: result.totalPages
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchAdminOrderById = createAsyncThunk<
  AdminOrder,
  string,
  { rejectValue: string }
>(
  'admin/fetchAdminOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const order = await adminSupabaseService.getOrderById(orderId);
      if (!order) {
        return rejectWithValue(`Order with ID ${orderId} not found`);
      }
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk<
  AdminOrder,
  UpdateOrderStatusRequest,
  { rejectValue: string }
>(
  'admin/updateAdminOrderStatus',
  async (request, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.updateOrderStatus(request);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

// Additional analytics actions
export const fetchAdminTopSellingProducts = createAsyncThunk<
  AdminProduct[],
  number | undefined,
  { rejectValue: string }
>(
  'admin/fetchAdminTopSellingProducts',
  async (limit, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.getTopSellingProducts(limit);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch top selling products');
    }
  }
);

export const fetchAdminLowStockProducts = createAsyncThunk<
  AdminProduct[],
  number | undefined,
  { rejectValue: string }
>(
  'admin/fetchAdminLowStockProducts',
  async (threshold, { rejectWithValue }) => {
    try {
      return await adminSupabaseService.getLowStockProducts(threshold);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch low stock products');
    }
  }
);