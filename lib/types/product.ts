 // src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  unit: 'kg' | 'piece' | 'bundle' | 'liter' | 'bunch' | '500g' | '5kg';
  category: ProductCategory;
  subCategory?: string;
  images: string[];
  stock: number;
  isOrganic: boolean;
  nutritionalInfo?: NutritionalInfo;
  tags: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins?: string[];
}

export interface ProductFilter {
  category?: string;
  subCategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  isOrganic?: boolean;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

