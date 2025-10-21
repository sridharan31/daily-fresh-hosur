import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductFilter, productService } from '../../services/product';

// Fetch categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await productService.getCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

// Fetch products with filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilter, { rejectWithValue }) => {
    try {
      const products = await productService.getProducts(filters);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

// Fetch featured products
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const products = await productService.getFeaturedProducts(limit);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured products');
    }
  }
);

// Fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryName, limit = 20 }: { categoryName: string; limit?: number }, { rejectWithValue }) => {
    try {
      const products = await productService.getProductsByCategory(categoryName, limit);
      return { categoryName, products };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products by category');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ query, limit = 20 }: { query: string; limit?: number }, { rejectWithValue }) => {
    try {
      const products = await productService.searchProducts(query, limit);
      return { query, products };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);