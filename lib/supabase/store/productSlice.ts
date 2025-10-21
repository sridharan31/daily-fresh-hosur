import { createSlice } from '@reduxjs/toolkit';
import { Category, Product } from '../services/product';
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchProductById,
  fetchProducts,
  fetchProductsByCategory,
  searchProducts
} from './actions/productActions';

interface ProductsState {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  productsByCategory: Record<string, Product[]>;
  searchResults: {
    query: string;
    products: Product[];
  };
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    sortBy: 'price_asc' | 'price_desc' | 'name' | 'rating' | 'popularity';
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
  };
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  featuredProducts: [],
  productsByCategory: {},
  searchResults: {
    query: '',
    products: []
  },
  currentProduct: null,
  isLoading: false,
  error: null,
  filter: {
    sortBy: 'name',
    minPrice: 0,
    maxPrice: 1000,
    inStock: true
  }
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    updateFilter: (state, action) => {
      state.filter = {
        ...state.filter,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryName, products } = action.payload;
        state.productsByCategory = {
          ...state.productsByCategory,
          [categoryName]: products
        };
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearCurrentProduct, updateFilter } = productsSlice.actions;
export default productsSlice.reducer;