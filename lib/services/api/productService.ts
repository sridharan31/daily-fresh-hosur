import { ApiResponse } from '../../types/api';
import { Product, ProductCategory, ProductFilter } from '../../types/product';
import apiClient from './apiClient';

class ProductService {
  // Get all products with optional filtering
  async getProducts(
    categoryId?: string,
    filter?: ProductFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Product[]>> {
    const params: any = {
      page,
      limit,
    };

    if (categoryId) {
      params.categoryId = categoryId;
    }

    if (filter) {
      // Map filter object to API parameters
      if (filter.minPrice !== undefined) params.minPrice = filter.minPrice;
      if (filter.maxPrice !== undefined) params.maxPrice = filter.maxPrice;
      if (filter.inStock !== undefined) params.inStock = filter.inStock;
      if (filter.isOrganic !== undefined) params.isOrganic = filter.isOrganic;
      if (filter.isFeatured !== undefined) params.isFeatured = filter.isFeatured;
      if (filter.brand) params.brand = filter.brand;
      if (filter.minRating !== undefined) params.minRating = filter.minRating;
      if (filter.sortBy) params.sortBy = filter.sortBy;
      if (filter.sortOrder) params.sortOrder = filter.sortOrder;
      if (filter.tags && filter.tags.length > 0) params.tags = filter.tags.join(',');
    }

    return await apiClient.get('/products', params);
  }

  // Get product by ID
  async getProductById(productId: string): Promise<ApiResponse<Product>> {
    return await apiClient.get(`/products/${productId}`);
  }

  // Search products
  async searchProducts(
    query: string,
    filter?: ProductFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Product[]>> {
    const params: any = {
      q: query,
      page,
      limit,
    };

    if (filter) {
      if (filter.categoryId) params.categoryId = filter.categoryId;
      if (filter.minPrice !== undefined) params.minPrice = filter.minPrice;
      if (filter.maxPrice !== undefined) params.maxPrice = filter.maxPrice;
      if (filter.inStock !== undefined) params.inStock = filter.inStock;
      if (filter.sortBy) params.sortBy = filter.sortBy;
      if (filter.sortOrder) params.sortOrder = filter.sortOrder;
    }

    return await apiClient.get('/products/search', params);
  }

  // Get product categories
  async getCategories(): Promise<ApiResponse<ProductCategory[]>> {
    return await apiClient.get('/categories');
  }

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<ApiResponse<ProductCategory>> {
    return await apiClient.get(`/categories/${categoryId}`);
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/featured', {limit});
  }

  // Get products on sale
  async getSaleProducts(limit: number = 20): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/sale', {limit});
  }

  // Get new arrivals
  async getNewArrivals(limit: number = 20): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/new-arrivals', {limit});
  }

  // Get products by category
  async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ApiResponse<Product[]>> {
    return await apiClient.get(`/categories/${categoryId}/products`, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  // Get similar products
  async getSimilarProducts(productId: string, limit: number = 6): Promise<ApiResponse<Product[]>> {
    return await apiClient.get(`/products/${productId}/similar`, {limit});
  }

  // Get product reviews
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any[]>> {
    return await apiClient.get(`/products/${productId}/reviews`, {page, limit});
  }

  // Add product review
  async addProductReview(
    productId: string,
    rating: number,
    comment: string,
    images?: string[]
  ): Promise<ApiResponse<any>> {
    return await apiClient.post(`/products/${productId}/reviews`, {
      rating,
      comment,
      images,
    });
  }

  // Get product stock status
  async getProductStock(productId: string): Promise<ApiResponse<{
    stock: number;
    isAvailable: boolean;
    restockDate?: string;
  }>> {
    return await apiClient.get(`/products/${productId}/stock`);
  }

  // Check multiple products stock
  async checkProductsStock(productIds: string[]): Promise<ApiResponse<Array<{
    productId: string;
    stock: number;
    isAvailable: boolean;
  }>>> {
    return await apiClient.post('/products/check-stock', {productIds});
  }

  // Get product nutrition info
  async getProductNutrition(productId: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/products/${productId}/nutrition`);
  }

  // Add product to wishlist
  async addToWishlist(productId: string): Promise<ApiResponse<void>> {
    return await apiClient.post('/wishlist/add', {productId});
  }

  // Remove product from wishlist
  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete(`/wishlist/${productId}`);
  }

  // Get user's wishlist
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/wishlist');
  }

  // Get product recommendations for user
  async getRecommendations(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/recommendations', {limit});
  }

  // Get trending products
  async getTrendingProducts(limit: number = 20): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/trending', {limit});
  }

  // Get products by brand
  async getProductsByBrand(
    brand: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Product[]>> {
    return await apiClient.get('/products/brand', {brand, page, limit});
  }

  // Get all brands
  async getBrands(): Promise<ApiResponse<Array<{
    name: string;
    productCount: number;
    logo?: string;
  }>>> {
    return await apiClient.get('/brands');
  }

  // Report product issue
  async reportProductIssue(
    productId: string,
    issueType: string,
    description: string
  ): Promise<ApiResponse<void>> {
    return await apiClient.post(`/products/${productId}/report`, {
      issueType,
      description,
    });
  }

  // Get product price history
  async getProductPriceHistory(
    productId: string,
    days: number = 30
  ): Promise<ApiResponse<Array<{
    date: string;
    price: number;
    discountedPrice?: number;
  }>>> {
    return await apiClient.get(`/products/${productId}/price-history`, {days});
  }

  // Set price alert
  async setPriceAlert(
    productId: string,
    targetPrice: number
  ): Promise<ApiResponse<void>> {
    return await apiClient.post('/price-alerts', {
      productId,
      targetPrice,
    });
  }

  // Get user's price alerts
  async getPriceAlerts(): Promise<ApiResponse<Array<{
    id: string;
    productId: string;
    targetPrice: number;
    isActive: boolean;
    createdAt: string;
  }>>> {
    return await apiClient.get('/price-alerts');
  }

  // Remove price alert
  async removePriceAlert(alertId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete(`/price-alerts/${alertId}`);
  }
}

export default new ProductService();