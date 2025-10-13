import { supabase } from '../supabase';

export interface Product {
  id: string;
  name_en: string;
  name_ta: string;
  description_en?: string;
  description_ta?: string;
  category_id?: string;
  category_en: string;
  category_ta: string;
  price: number;
  mrp?: number;
  discount_percentage: number;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity: number;
  unit: string;
  weight?: number;
  gst_rate: number;
  hsn_code?: string;
  fssai_license?: string;
  is_organic: boolean;
  is_featured: boolean;
  is_seasonal: boolean;
  is_active: boolean;
  images: string[];
  nutritional_info?: any;
  storage_instructions?: string;
  origin_state: string;
  expiry_days?: number;
  tags: string[];
  rating: number;
  review_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_ta: string;
  description_en?: string;
  description_ta?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

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

class ProductService {
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
  }

  // Get products with filters
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

      if (filters.priceMin) {
        query = query.gte('price', filters.priceMin);
      }

      if (filters.priceMax) {
        query = query.lte('price', filters.priceMax);
      }

      if (filters.isOrganic !== undefined) {
        query = query.eq('is_organic', filters.isOrganic);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Apply sorting
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
        default:
          query = query.order('is_featured', { ascending: false })
                      .order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get product by ID error:', error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .gt('stock_quantity', 0)
        .order('sold_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_en', category)
        .gt('stock_quantity', 0)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(
          `name_en.ilike.%${searchTerm}%,name_ta.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
        )
        .gt('stock_quantity', 0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  // Get similar products (same category, different product)
  async getSimilarProducts(productId: string, category: string, limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_en', category)
        .neq('id', productId)
        .gt('stock_quantity', 0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get similar products error:', error);
      throw error;
    }
  }

  // Get seasonal products
  async getSeasonalProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_seasonal', true)
        .gt('stock_quantity', 0)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get seasonal products error:', error);
      throw error;
    }
  }

  // Get organic products
  async getOrganicProducts(limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_organic', true)
        .gt('stock_quantity', 0)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get organic products error:', error);
      throw error;
    }
  }

  // Get top selling products
  async getTopSellingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('sold_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get top selling products error:', error);
      throw error;
    }
  }

  // Get products with low stock (for admin)
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  // Update product stock after order
  async updateProductStock(productId: string, quantityOrdered: number): Promise<void> {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity, sold_count')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newStockQuantity = product.stock_quantity - quantityOrdered;
      const newSoldCount = product.sold_count + quantityOrdered;

      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: Math.max(0, newStockQuantity),
          sold_count: newSoldCount
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Log inventory change
      await this.logInventoryChange(
        productId,
        'sale',
        -quantityOrdered,
        product.stock_quantity,
        newStockQuantity,
        'Order placed'
      );

    } catch (error) {
      console.error('Update product stock error:', error);
      throw error;
    }
  }

  // Log inventory changes
  async logInventoryChange(
    productId: string,
    type: 'purchase' | 'sale' | 'adjustment' | 'expired',
    quantityChange: number,
    oldQuantity: number,
    newQuantity: number,
    reason: string,
    referenceId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: productId,
          type,
          quantity_change: quantityChange,
          old_quantity: oldQuantity,
          new_quantity: newQuantity,
          reason,
          reference_id: referenceId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Log inventory change error:', error);
      // Don't throw here as it's not critical for the main operation
    }
  }

  // Calculate effective price (after discount)
  calculateEffectivePrice(product: Product): number {
    if (product.discount_percentage > 0) {
      return product.price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  }

  // Calculate savings amount
  calculateSavings(product: Product): number {
    if (product.mrp && product.mrp > product.price) {
      return product.mrp - product.price;
    }
    if (product.discount_percentage > 0) {
      return product.price * (product.discount_percentage / 100);
    }
    return 0;
  }

  // Check if product is in stock
  isInStock(product: Product, quantity: number = 1): boolean {
    return product.stock_quantity >= quantity;
  }

  // Check if quantity is within limits
  isValidQuantity(product: Product, quantity: number): boolean {
    return quantity >= product.min_order_quantity && quantity <= product.max_order_quantity;
  }

  // Get product reviews
  async getProductReviews(productId: string, limit: number = 10, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users!product_reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get product reviews error:', error);
      throw error;
    }
  }

  // Add product review
  async addProductReview(
    productId: string,
    orderId: string,
    rating: number,
    title: string,
    comment: string,
    images: string[] = []
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          order_id: orderId,
          rating,
          title,
          comment,
          images,
          is_verified_purchase: true,
          is_approved: false // Reviews need approval
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Add product review error:', error);
      throw error;
    }
  }

  // Get price history for a product (if tracking)
  async getProductPriceHistory(productId: string, days: number = 30) {
    try {
      // This would require a separate price_history table
      // For now, just return current price
      const product = await this.getProductById(productId);
      
      if (!product) throw new Error('Product not found');

      return [{
        date: new Date().toISOString(),
        price: product.price,
        mrp: product.mrp
      }];
    } catch (error) {
      console.error('Get product price history error:', error);
      throw error;
    }
  }

  // Update product views (for analytics)
  async trackProductView(productId: string) {
    try {
      // This could be implemented with a separate product_views table
      // For now, we'll just increment a view counter if it exists
      console.log(`Product ${productId} viewed`);
    } catch (error) {
      console.error('Track product view error:', error);
    }
  }
}

export default new ProductService();