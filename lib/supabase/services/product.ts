import { supabase } from '../client';
import { Database } from '../schema/types';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

export interface ProductFilter {
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  isOrganic?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'rating' | 'popularity';
  limit?: number;
  offset?: number;
}

// Product service for Supabase
export const productService = {
  // Get all active categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  },

  // Get all active products with filters
  async getProducts(filters: ProductFilter = {}): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.category) {
        query = query.eq('category_en', filters.category);
      }

      if (filters.search) {
        query = query.or(
          `name_en.ilike.%${filters.search}%,name_ta.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`
        );
      }

      if (filters.priceMin !== undefined) {
        query = query.gte('price', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
        query = query.lte('price', filters.priceMax);
      }

      if (filters.isOrganic !== undefined) {
        query = query.eq('is_organic', filters.isOrganic);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      if (filters.inStock !== undefined && filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'name':
            query = query.order('name_en', { ascending: true });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'popularity':
            query = query.order('sold_count', { ascending: false });
            break;
        }
      } else {
        // Default sorting by featured
        query = query.order('is_featured', { ascending: false }).order('name_en');
      }

      // Apply pagination
      if (filters.limit !== undefined) {
        query = query.limit(filters.limit);
      }

      if (filters.offset !== undefined) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get product by ID error:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('name_en', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(categoryName: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_en', categoryName)
        .order('is_featured', { ascending: false })
        .order('name_en', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name_en.ilike.%${query}%,name_ta.ilike.%${query}%,description_en.ilike.%${query}%,tags.cs.{${query}}`)
        .order('is_featured', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }
};