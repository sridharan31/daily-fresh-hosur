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
import { useTheme } from '../../src/hooks/useTheme';

import { Product } from '../../lib/types/product';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import ProductCard from '../../src/components/product/ProductCard';
import { useCart } from '../../src/hooks/useCart';

// Mock data for category products - In real app, this would come from API
const CATEGORY_PRODUCTS: Record<string, Product[]> = {
  '1': [ // Fresh Vegetables
    {
      id: 'veg1',
      name: 'Fresh Spinach',
      price: 8.99,
      originalPrice: 10.99,
      unit: 'bunch',
      category: { id: '1', name: 'Fresh Vegetables', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/228B22/FFFFFF?text=Spinach'],
      stock: 45,
      isOrganic: true,
      tags: ['fresh', 'vegetable', 'organic', 'leafy'],
      isActive: true,
      rating: 4.7,
      reviewCount: 89,
      description: 'Fresh organic spinach leaves, perfect for salads and cooking.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'veg2',
      name: 'Red Tomatoes',
      price: 12.50,
      unit: 'kg',
      category: { id: '1', name: 'Fresh Vegetables', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/FF6347/FFFFFF?text=Tomato'],
      stock: 60,
      isOrganic: false,
      tags: ['fresh', 'vegetable', 'red'],
      isActive: true,
      rating: 4.5,
      reviewCount: 142,
      description: 'Fresh red tomatoes, perfect for cooking and salads.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'veg3',
      name: 'Fresh Carrots',
      price: 9.75,
      unit: 'kg',
      category: { id: '1', name: 'Fresh Vegetables', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/FFA500/000000?text=Carrot'],
      stock: 40,
      isOrganic: true,
      tags: ['fresh', 'vegetable', 'organic', 'root'],
      isActive: true,
      rating: 4.6,
      reviewCount: 98,
      description: 'Organic carrots, sweet and crunchy.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  '2': [ // Fresh Fruits
    {
      id: 'fruit1',
      name: 'Fresh Bananas',
      price: 12.99,
      originalPrice: 15.99,
      unit: 'kg',
      category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
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
      id: 'fruit2',
      name: 'Red Apples',
      price: 18.50,
      originalPrice: 20.00,
      unit: 'kg',
      category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
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
      id: 'fruit3',
      name: 'Fresh Oranges',
      price: 15.25,
      unit: 'kg',
      category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
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
    }
  ],
  '3': [ // Organic Vegetables
    {
      id: 'orgveg1',
      name: 'Organic Broccoli',
      price: 22.99,
      unit: 'kg',
      category: { id: '3', name: 'Organic Vegetables', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/228B22/FFFFFF?text=Broccoli'],
      stock: 25,
      isOrganic: true,
      tags: ['organic', 'vegetable', 'healthy', 'cruciferous'],
      isActive: true,
      rating: 4.8,
      reviewCount: 67,
      description: 'Fresh organic broccoli, packed with nutrients.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  '4': [ // Organic Fruits
    {
      id: 'orgfruit1',
      name: 'Organic Strawberries',
      price: 28.99,
      unit: '500g',
      category: { id: '4', name: 'Organic Fruits', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/FF69B4/FFFFFF?text=Strawberry'],
      stock: 30,
      isOrganic: true,
      tags: ['organic', 'fruit', 'berry', 'sweet'],
      isActive: true,
      rating: 4.9,
      reviewCount: 145,
      description: 'Sweet and juicy organic strawberries.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  '5': [ // Rice & Grains
    {
      id: 'grain1',
      name: 'Basmati Rice',
      price: 45.99,
      unit: '5kg',
      category: { id: '5', name: 'Rice & Grains', image: '', isActive: true },
      images: ['https://via.placeholder.com/200x200/DEB887/000000?text=Rice'],
      stock: 20,
      isOrganic: false,
      tags: ['rice', 'grain', 'basmati'],
      isActive: true,
      rating: 4.7,
      reviewCount: 234,
      description: 'Premium quality Basmati rice.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

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

  useEffect(() => {
    loadCategoryProducts();
  }, [id]);

  const loadCategoryProducts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const categoryProducts = CATEGORY_PRODUCTS[id || '1'] || [];
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
    } catch (error) {
      console.error('Error loading category products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
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
    <SafeAreaView style={styles.container}>
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
        keyExtractor={(item) => item.id}
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