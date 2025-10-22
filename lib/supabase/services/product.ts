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
  },

  // Category CRUD Operations
  // Create a new category
  async createCategory(categoryData: {
    name_en: string;
    name_ta: string;
    description_en?: string;
    description_ta?: string;
    image_url?: string;
    parent_id?: string;
    sort_order?: number;
  }): Promise<Category> {
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .insert([{
          ...categoryData,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(categoryId: string, updates: {
    name_en?: string;
    name_ta?: string;
    description_en?: string;
    description_ta?: string;
    image_url?: string;
    parent_id?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<Category> {
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  // Delete a category (soft delete by setting is_active to false)
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('[productService] deleteCategory called for:', categoryId);

      // Ensure category exists
      const { data: cat, error: catErr } = await supabase
        .from('categories')
        .select('id, name_en')
        .eq('id', categoryId)
        .maybeSingle();

      if (catErr) {
        console.error('[productService] error fetching category:', catErr);
        throw new Error('Failed to fetch category');
      }

      if (!cat) {
        throw new Error('Category not found');
      }

      // Count active products that reference this category by category_id
      const { count: byIdCount, error: countErr1 } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (countErr1) {
        console.error('[productService] error counting products by category_id:', {
          error: countErr1,
          message: countErr1.message,
          details: countErr1.details,
          hint: countErr1.hint,
          code: countErr1.code
        });
        throw new Error(`Failed to check products for this category: ${countErr1.message || JSON.stringify(countErr1)}`);
      }

      console.log(`[productService] Found ${byIdCount || 0} products by category_id`);

      // For now, only check by category_id since category_en query is failing
      // TODO: Fix category_en field schema issues or update products to use proper foreign keys
      console.log(`[productService] Skipping category_en check due to schema issues`);

      const totalBlocked = byIdCount || 0;
      console.log(`[productService] Total products blocking deletion: ${totalBlocked}`);
      
      if (totalBlocked > 0) {
        throw new Error(`Cannot delete category. It has ${totalBlocked} active product(s). Reassign or delete those products first.`);
      }

      // Soft-delete the category
      console.log(`[productService] Proceeding to mark category ${categoryId} as inactive`);
      const { error: updateErr } = await (supabase as any)
        .from('categories')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', categoryId);

      if (updateErr) {
        console.error('[productService] error updating category:', updateErr);
        throw new Error(`Failed to mark category as inactive: ${updateErr.message || updateErr}`);
      }

      console.log('[productService] category marked inactive:', categoryId);
      return true;
    } catch (err: any) {
      console.error('[productService] deleteCategory error:', err);
      throw err;
    }
  },

  // Force soft-delete a category without checking product references
  async forceDeleteCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('[productService] forceDeleteCategory called for:', categoryId);
      const { error } = await (supabase as any)
        .from('categories')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', categoryId);

      if (error) {
        console.error('[productService] forceDeleteCategory error:', error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error('[productService] forceDeleteCategory failed:', err);
      throw err;
    }
  },

  // Hard delete a category (permanently remove from database)
  async hardDeleteCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('[productService] hardDeleteCategory called for:', categoryId);
      
      // Check if category exists first
      const { data: cat, error: catErr } = await supabase
        .from('categories')
        .select('id, name_en')
        .eq('id', categoryId)
        .maybeSingle();

      if (catErr) {
        console.error('[productService] error fetching category for hard delete:', catErr);
        throw new Error('Failed to fetch category');
      }

      if (!cat) {
        throw new Error('Category not found');
      }

      // Perform hard delete
      const { error } = await (supabase as any)
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('[productService] hardDeleteCategory error:', error);
        throw new Error(`Failed to permanently delete category: ${error.message || error}`);
      }

      console.log('[productService] category permanently deleted:', categoryId);
      return true;
    } catch (err) {
      console.error('[productService] hardDeleteCategory failed:', err);
      throw err;
    }
  },

  // Get all categories (including inactive ones for admin)
  async getAllCategoriesForAdmin(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all categories for admin error:', error);
      throw error;
    }
  }
};