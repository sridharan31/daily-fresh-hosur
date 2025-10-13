 import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import productService from '../../services/api/productService';
import { ApiResponse } from '../../types/api';
import { Product, ProductCategory, ProductFilter, ProductState } from '../../types/product';

// Async thunks
export const fetchProducts = createAsyncThunk<
  Product[],
  {categoryId?: string; filter?: ProductFilter},
  {rejectValue: string}
>(
  'product/fetchProducts',
  async ({categoryId, filter}, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Product[]> = await productService.getProducts(categoryId, filter);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk<
  Product,
  string,
  {rejectValue: string}
>(
  'product/fetchProductById',
  async (productId, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Product> = await productService.getProductById(productId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const fetchCategories = createAsyncThunk<
  ProductCategory[],
  void,
  {rejectValue: string}
>(
  'product/fetchCategories',
  async (_, {rejectWithValue}) => {
    try {
      const response: ApiResponse<ProductCategory[]> = await productService.getCategories();
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const searchProducts = createAsyncThunk<
  Product[],
  {query: string; filter?: ProductFilter},
  {rejectValue: string}
>(
  'product/searchProducts',
  async ({query, filter}, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Product[]> = await productService.searchProducts(query, filter);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk<
  Product[],
  void,
  {rejectValue: string}
>(
  'product/fetchFeaturedProducts',
  async (_, {rejectWithValue}) => {
    try {
      const response: ApiResponse<Product[]> = await productService.getFeaturedProducts();
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured products');
    }
  }
);

// Initial state
const initialState: ProductState = {
  products: [],
  categories: [],
  featuredProducts: [],
  currentProduct: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
  searchError: null,
  filter: {
    sortBy: 'name',
    sortOrder: 'asc',
    minPrice: 0,
    maxPrice: 1000,
    inStock: true,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    setFilter: (state, action: PayloadAction<Partial<ProductFilter>>) => {
      state.filter = {...state.filter, ...action.payload};
    },
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    updateProductStock: (state, action: PayloadAction<{productId: string; stock: number}>) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) {
        product.stock = action.payload.stock;
      }
      if (state.currentProduct?.id === action.payload.productId) {
        state.currentProduct.stock = action.payload.stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product';
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload || 'Failed to search products';
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      });
  },
});

export const {
  clearProducts,
  clearCurrentProduct,
  clearSearchResults,
  setFilter,
  clearError,
  updateProductStock,
} = productSlice.actions;

export default productSlice.reducer;
