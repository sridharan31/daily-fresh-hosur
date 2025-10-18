// lib/adapters/productAdapter.ts
import { Category as SupabaseCategory, Product as SupabaseProduct } from '../services/productService';
import { Product, ProductCategory } from '../types/product';

/**
 * Adapts the Supabase product model to the app's product model
 */
export function adaptProductForApp(supabaseProduct: SupabaseProduct): Product {
  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name_en, // Use English name as default
    description: supabaseProduct.description_en || '',
    price: supabaseProduct.price,
    originalPrice: supabaseProduct.mrp,
    unit: supabaseProduct.unit as any, // Cast to expected unit type
    category: {
      id: supabaseProduct.category_id || supabaseProduct.id,
      name: supabaseProduct.category_en,
      image: '',
      isActive: supabaseProduct.is_active
    },
    images: supabaseProduct.images,
    stock: supabaseProduct.stock_quantity,
    isOrganic: supabaseProduct.is_organic,
    tags: supabaseProduct.tags,
    isActive: supabaseProduct.is_active,
    rating: supabaseProduct.rating,
    reviewCount: supabaseProduct.review_count,
    createdAt: supabaseProduct.created_at,
    updatedAt: supabaseProduct.updated_at
  };
}

/**
 * Adapts a category from Supabase format to app format
 */
export function adaptCategoryForApp(supabaseCategory: SupabaseCategory): ProductCategory {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name_en,
    image: supabaseCategory.image_url || '',
    isActive: supabaseCategory.is_active
  };
}

/**
 * Adapts an array of Supabase products to app products
 */
export function adaptProductsForApp(supabaseProducts: SupabaseProduct[]): Product[] {
  return supabaseProducts.map(adaptProductForApp);
}

/**
 * Adapts an array of Supabase categories to app categories
 */
export function adaptCategoriesForApp(supabaseCategories: SupabaseCategory[]): ProductCategory[] {
  return supabaseCategories.map(adaptCategoryForApp);
}