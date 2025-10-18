import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adaptProductsForApp } from '../../lib/adapters/productAdapter';
import productService from '../../lib/services/productService';
import { useTheme } from '../../src/hooks/useTheme';

import { Product } from '../../lib/types/product';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import ProductCard from '../../src/components/product/ProductCard';
import { useCart } from '../../src/hooks/useCart';

// Products will be fetched from Supabase

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name A-Z', value: 'name_asc' },
];

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { addItem } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [categoryName, setCategoryName] = useState(name || 'Category');

  useEffect(() => {
    loadCategoryProducts();
  }, [id]);

  const loadCategoryProducts = async () => {
    setIsLoading(true);
    try {
      // Try to get the category information
      let categoryNameToDisplay = name || 'Category';
      
      console.log(`Loading products for category ID: ${id}, name: ${name}`);
      
      // Use our enhanced method that accepts either ID or name
      const supabaseProducts = await productService.getProductsByCategoryIdentifier(id, 50);
      
      console.log(`Retrieved ${supabaseProducts.length} products from Supabase`);
      if (supabaseProducts.length > 0) {
        console.log(`First product category info: ID=${supabaseProducts[0].category_id}, name=${supabaseProducts[0].category_en}`);
      }
      
      // If we got products, try to find a better category name
      if (supabaseProducts.length > 0) {
        // Use the name from first product's category if available
        categoryNameToDisplay = supabaseProducts[0].category_en || categoryNameToDisplay;
      } else {
        // If no products found, try to get category details directly
        console.log(`No products found, fetching category details`);
        const categories = await productService.getCategories();
        const categoryData = categories.find(cat => cat.id === id || cat.name_en === name);
        if (categoryData) {
          console.log(`Found category: ${categoryData.name_en}, ID: ${categoryData.id}`);
          categoryNameToDisplay = categoryData.name_en;
        }
      }
      
      // Update category name in state
      setCategoryName(categoryNameToDisplay);
      
      // Convert to app product format
      const appProducts = adaptProductsForApp(supabaseProducts);
      
      // If no products found, try a fallback search
      if (appProducts.length === 0) {
        console.log(`No products found for category ID ${id}, trying fallback search`);
        // Try to get products by searching instead
        const fallbackProducts = await productService.searchProducts(categoryNameToDisplay, 50);
        const fallbackAppProducts = adaptProductsForApp(fallbackProducts);
        setProducts(fallbackAppProducts);
        setFilteredProducts(fallbackAppProducts);
      } else {
        setProducts(appProducts);
        setFilteredProducts(appProducts);
      }
    } catch (error) {
      console.error('Error loading category products:', error);
      Alert.alert(
        'Error',
        'Failed to load products. Please try again.',
        [{ text: 'Retry', onPress: loadCategoryProducts }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategoryProducts();
    setRefreshing(false);
  };

  const handleSort = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortModal(false);
    
    let sorted = [...products];
    
    switch (sortValue) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }
    
    setFilteredProducts(sorted);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      await addItem(product, quantity);
      Alert.alert(
        'Added to Cart!',
        `${product.name} (${quantity} x ${product.unit}) added to cart.`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { 
            text: 'View Cart', 
            style: 'default',
            onPress: () => router.push('/(tabs)/cart')
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productContainer, index % 2 === 1 && styles.productContainerRight]}>
      <ProductCard
        product={item}
        onPress={handleProductPress}
        onAddToCart={handleAddToCart}
        variant="grid"
        style={styles.productCard}
      />
    </View>
  );

  const renderSortModal = () => {
    if (!showSortModal) return null;
    
    return (
      <View style={styles.sortModalOverlay}>
        <View style={styles.sortModal}>
          <Text style={styles.sortModalTitle}>Sort by</Text>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.selectedSortOption
              ]}
              onPress={() => handleSort(option.value)}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.value && styles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Icon name="check" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.sortModalClose}
            onPress={() => setShowSortModal(false)}
          >
            <Text style={styles.sortModalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{name || 'Category'}</Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Icon name="sort" size={24} color="#333" />
          </TouchableOpacity>
        </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item: Product) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="shopping-basket" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try refreshing or check back later
            </Text>
          </View>
        )}
      />

      {/* Sort Modal */}
      {renderSortModal()}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  productCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sortButton: {
    padding: 8,
    marginLeft: 8,
  },
  productsList: {
    padding: 16,
  },
  productContainer: {
    flex: 1,
    marginBottom: 16,
  },
  productContainerRight: {
    marginLeft: 8,
  },
  productCard: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  sortModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  selectedSortOption: {
    backgroundColor: colors.primaryBackground,
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedSortOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  sortModalClose: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sortModalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});