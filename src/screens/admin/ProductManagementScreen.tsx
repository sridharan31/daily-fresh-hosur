// src/screens/admin/ProductManagementScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from '../../components/ui/WebCompatibleComponents';
// Navigation imports
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

// Import services and types
import { adaptCategoriesForApp, adaptProductsForApp } from '../../../lib/adapters/productAdapter';
import { productService as supabaseProductService } from '../../../lib/supabase/services/product';
import { Product, ProductCategory } from '../../../lib/types/product';

const width = 800; // Default width for web
const isWeb = Platform.OS === 'web';

interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'price' | 'rating' | 'stock';
  sortOrder: 'asc' | 'desc';
  showOutOfStock: boolean;
}

const ProductManagementScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation();
  const router = useRouter();
  
  // State management
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: null,
    sortBy: 'name',
    sortOrder: 'asc',
    showOutOfStock: true
  });

  // Load data from Supabase
  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      // Fetch categories and products in parallel
      const [categoriesResponse, productsResponse] = await Promise.all([
        supabaseProductService.getCategories(),
        supabaseProductService.getProducts({ limit: 100 })
      ]);

      // Adapt data for app format
      const adaptedCategories = adaptCategoriesForApp(categoriesResponse as any);
      const adaptedProducts = adaptProductsForApp(productsResponse as any);

      setCategories(adaptedCategories);
      setProducts(adaptedProducts);
      setFilteredProducts(adaptedProducts);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products and categories. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.id === filters.selectedCategory
      );
    }

    // Stock filter
    if (!filters.showOutOfStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  // Effects
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Event handlers
  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setFilters(prev => ({ ...prev, selectedCategory: categoryId }));
  };

  const handleSearchChange = (text: string) => {
    setFilters(prev => ({ ...prev, searchQuery: text }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleOutOfStock = () => {
    setFilters(prev => ({ ...prev, showOutOfStock: !prev.showOutOfStock }));
  };

  // Render functions
  const renderCategoryItem = ({ item }: { item: ProductCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        filters.selectedCategory === item.id && styles.categoryCardSelected
      ]}
      onPress={() => handleCategorySelect(
        filters.selectedCategory === item.id ? null : item.id
      )}
    >
      <View style={styles.categoryImageContainer}>
        <Text style={styles.categoryEmoji}>
          {getCategoryEmoji(item.name)}
        </Text>
      </View>
      <Text style={[
        styles.categoryText,
        filters.selectedCategory === item.id && styles.categoryTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Handle product actions
  const handleViewProduct = (productId: string) => {
    (navigation as any).navigate('ProductDetails', { productId });
  };

  const handleEditProduct = (productId: string) => {
    (navigation as any).navigate('EditProduct', { productId });
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(productId);
            try {
              // Delete from Supabase
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

              if (error) throw error;

              // Update local state
              setProducts(prev => prev.filter(p => p.id !== productId));
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    setActionLoading(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, isActive: !currentStatus } : p
      ));
      
      Alert.alert('Success', `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update product status');
    } finally {
      setActionLoading(null);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        style={styles.productContent}
        onPress={() => handleViewProduct(item.id)}
      >
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            item.stock > 0 ? styles.inStockBadge : styles.outOfStockBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.stock > 0 ? styles.inStockText : styles.outOfStockText
            ]}>
              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productMeta}>
          <Text style={styles.categoryTag}>{item.category.name}</Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
        
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
        
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
          {item.isOrganic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>🌱 Organic</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item.id)}
          disabled={actionLoading === item.id}
        >
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, item.isActive ? styles.deactivateButton : styles.activateButton]}
          onPress={() => handleToggleStatus(item.id, item.isActive)}
          disabled={actionLoading === item.id}
        >
          <Text style={[styles.actionButtonText, !item.isActive && styles.activateButtonText]}>
            {actionLoading === item.id ? '⏳' : (item.isActive ? '⏸️ Disable' : '▶️ Enable')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id, item.name)}
          disabled={actionLoading === item.id}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.title}>Product Management</Text>
          <Text style={styles.subtitle}>
            {filteredProducts.length} of {products.length} products
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => (navigation as any).navigate('AddProduct')}
        >
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={filters.searchQuery}
          onChangeText={handleSearchChange}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {(['name', 'price', 'rating', 'stock'] as const).map((sortOption) => (
            <TouchableOpacity
              key={sortOption}
              style={[
                styles.sortButton,
                filters.sortBy === sortOption && styles.sortButtonActive
              ]}
              onPress={() => handleSortChange(sortOption)}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === sortOption && styles.sortButtonTextActive
              ]}>
                {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                {filters.sortBy === sortOption && (
                  <Text> {filters.sortOrder === 'asc' ? '↑' : '↓'}</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stock Toggle */}
      <TouchableOpacity 
        style={styles.toggleContainer}
        onPress={toggleOutOfStock}
      >
        <Text style={styles.toggleLabel}>Show out of stock items</Text>
        <View style={[
          styles.toggle,
          filters.showOutOfStock && styles.toggleActive
        ]}>
          <View style={[
            styles.toggleIndicator,
            filters.showOutOfStock && styles.toggleIndicatorActive
          ]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  // Helper function for category emojis
  const getCategoryEmoji = (categoryName: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Dairy': '🥛',
      'Grocery': '🛒',
      'Spices': '🌶️',
      'Organic': '🌱',
      'Frozen': '❄️',
      'Bakery': '🍞'
    };
    return emojiMap[categoryName] || '🏷️';
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item: Product) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
          />
        }
        contentContainerStyle={styles.productsContainer}
        numColumns={isWeb ? Math.floor(width / 300) : 1}
        key={isWeb ? Math.floor(width / 300) : 1} // Force re-render when columns change
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {renderHeader()}
            
            {/* Categories Section */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <FlatList
                horizontal
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item: ProductCategory) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              />
            </View>

            {/* Filters and Search */}
            {renderSearchAndFilters()}

            {/* Products Section Header */}
            <View style={styles.productsHeaderSection}>
              <Text style={styles.sectionTitle}>Products</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  categoryImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  sortButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ced4da',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#28a745',
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  productsSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  productsHeaderSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  productsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    ...(isWeb && {
      width: 280,
      marginRight: 16,
    }),
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inStockBadge: {
    backgroundColor: '#d4edda',
  },
  outOfStockBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inStockText: {
    color: '#155724',
  },
  outOfStockText: {
    color: '#721c24',
  },
  productDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unitText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6c757d',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffc107',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  organicBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  organicText: {
    fontSize: 11,
    color: '#155724',
    fontWeight: '600',
  },
  productContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  activateButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default ProductManagementScreen;