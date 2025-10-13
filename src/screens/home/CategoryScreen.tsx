import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Product } from '../../../lib/types/product';
import LoadingScreen from '../../components/common/LoadingScreen';
import ProductCard from '../../components/product/ProductCard';

// Mock data for category products
const CATEGORY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Bananas',
    price: 12.99,
    originalPrice: 15.99,
    unit: 'kg',
    category: { id: '1', name: 'Fresh Fruits', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FFE135/000000?text=Banana'],
    stock: 50,
    isOrganic: false,
    tags: ['fresh', 'fruit', 'healthy'],
    isActive: true,
    rating: 4.5,
    reviewCount: 128,
    description: 'Fresh and ripe bananas, perfect for breakfast or snacks.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Red Apples',
    price: 18.50,
    originalPrice: 20.00,
    unit: 'kg',
    category: { id: '1', name: 'Fresh Fruits', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FF0000/FFFFFF?text=Apple'],
    stock: 75,
    isOrganic: true,
    tags: ['fresh', 'fruit', 'organic'],
    isActive: true,
    rating: 4.8,
    reviewCount: 203,
    description: 'Crisp and sweet red apples, perfect for snacking.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Fresh Oranges',
    price: 15.25,
    unit: 'kg',
    category: { id: '1', name: 'Fresh Fruits', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FFA500/000000?text=Orange'],
    stock: 60,
    isOrganic: false,
    tags: ['fresh', 'fruit', 'vitamin-c'],
    isActive: true,
    rating: 4.6,
    reviewCount: 156,
    description: 'Juicy and fresh oranges, packed with vitamin C.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name A-Z', value: 'name_asc' },
];

export const CategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get category info from route params
  const { categoryId, categoryName } = route.params as { 
    categoryId: string; 
    categoryName: string; 
  } || { categoryId: '1', categoryName: 'Fresh Fruits' };

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    loadCategoryProducts();
  }, [categoryId]);

  useEffect(() => {
    sortProducts();
  }, [sortBy]);

  const loadCategoryProducts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(CATEGORY_PRODUCTS);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = () => {
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'price_asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'name_asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }
    
    setProducts(sortedProducts);
  };

  const handleProductPress = (product: Product) => {
    Alert.alert('Product', `Selected: ${product.name}`);
  };

  const handleAddToCart = (product: Product) => {
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const handleSortPress = () => {
    setShowSortModal(true);
  };

  const handleSortSelection = (value: string) => {
    setSortBy(value);
    setShowSortModal(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleAddToCart(item)}
    />
  );

  const renderSortOption = ({ item }: { item: typeof SORT_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        sortBy === item.value && styles.selectedSortOption,
      ]}
      onPress={() => handleSortSelection(item.value)}
    >
      <Text
        style={[
          styles.sortOptionText,
          sortBy === item.value && styles.selectedSortOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading products..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Products Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.sortModal}>
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>Sort by</Text>
            <FlatList
              data={SORT_OPTIONS}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productRow}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 2,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  sortButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sortButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  productsList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sortModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  sortOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedSortOption: {
    backgroundColor: '#007AFF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectedSortOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

// Default export to satisfy Expo Router (this file should be treated as a route)
export default CategoryScreen;

