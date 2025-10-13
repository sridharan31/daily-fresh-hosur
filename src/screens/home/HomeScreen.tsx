import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Product } from '../../../lib/types/product';
import { FilterModal, FilterOptions } from '../../components/common/FilterModal.web';
import LoadingScreen from '../../components/common/LoadingScreen';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';

const CATEGORIES = [
  { id: '1', name: 'Fresh Vegetables', emoji: '🥬' },
  { id: '2', name: 'Fresh Fruits', emoji: '🍎' },
  { id: '3', name: 'Organic Vegetables', emoji: '🌱' },
  { id: '4', name: 'Organic Fruits', emoji: '🍎' },
  { id: '5', name: 'Rice & Grains', emoji: '�' },
  { id: '6', name: 'Special Offers', emoji: '💰' },
];

const FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    price: 15.99,
    originalPrice: 18.99,
    unit: 'kg',
    category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FFE135/000000?text=🍌+Organic'],
    stock: 50,
    isOrganic: true,
    tags: ['organic', 'fruit', 'healthy', 'premium'],
    isActive: true,
    rating: 4.8,
    reviewCount: 256,
    description: 'Certified organic bananas, grown without pesticides. Perfect for breakfast or snacks.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Organic Spinach',
    price: 8.50,
    originalPrice: 10.00,
    unit: 'bundle',
    category: { id: '3', name: 'Organic Vegetables', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/228B22/FFFFFF?text=🌱+Spinach'],
    stock: 30,
    isOrganic: true,
    tags: ['organic', 'vegetable', 'healthy', 'iron-rich'],
    isActive: true,
    rating: 4.8,
    reviewCount: 194,
    description: 'Certified organic spinach leaves, rich in iron and vitamins. Grown without pesticides.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Basmati Rice (Premium)',
    price: 24.99,
    originalPrice: 28.99,
    unit: 'kg',
    category: { id: '5', name: 'Rice & Grains', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/F5F5DC/8B4513?text=🌾+Rice'],
    stock: 200,
    isOrganic: false,
    tags: ['rice', 'premium', 'basmati', 'long-grain'],
    isActive: true,
    rating: 4.9,
    reviewCount: 512,
    description: 'Premium quality Basmati rice with long grains and aromatic fragrance.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Organic Tomatoes',
    price: 12.99,
    originalPrice: 15.99,
    unit: 'kg',
    category: { id: '3', name: 'Organic Vegetables', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FF6347/FFFFFF?text=🍅+Organic'],
    stock: 75,
    isOrganic: true,
    tags: ['organic', 'tomato', 'fresh', 'vitamin-c'],
    isActive: true,
    rating: 4.6,
    reviewCount: 328,
    description: 'Fresh organic tomatoes, perfect for cooking and salads. Rich in lycopene and vitamin C.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addItem, getItemQuantity } = useCart();
  const cart = useSelector((state: any) => state.cart?.items || []);
  const cartItemCount = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Listen for filter button events from header
  useEffect(() => {
    const handleFilterEvent = () => {
      setShowFilterModal(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openHomeFilters', handleFilterEvent);
      return () => {
        window.removeEventListener('openHomeFilters', handleFilterEvent);
      };
    }
  }, []);

  const loadData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedProducts(FEATURED_PRODUCTS);
      setFilteredProducts(FEATURED_PRODUCTS);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (filters: FilterOptions) => {
    let filtered = [...featuredProducts];

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category.includes(product.category.name)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
    );

    // Apply organic filter
    if (filters.organic) {
      filtered = filtered.filter(product => product.isOrganic);
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Apply sorting
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
        case 'newest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredProducts(filtered);
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setFilteredProducts(featuredProducts);
    setActiveFilters(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    router.push('/search/' as any);
  };

  const handleMyOrders = () => {
    router.push('/(tabs)/orders');
  };

  const handleFavorites = () => {
    router.push('/favorites/' as any);
  };

  const handleOffers = () => {
    router.push('/offers');
  };

  const handleSupport = () => {
    router.navigate('/support/' as any);
  };

  const handleCategoryPress = (category: { id: string; name: string }) => {
    router.push({
      pathname: '/category/[id]' as any,
      params: { id: category.id, name: category.name }
    });
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]' as any,
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      await addItem(product, quantity);
      const newQuantity = getItemQuantity(product.id) + quantity;
      Alert.alert(
        'Added to Cart!', 
        `${product.name} (${quantity} x ${product.unit}) added to cart.\nCart total: ${newQuantity} items`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { 
            text: 'View Cart', 
            style: 'default',
            onPress: () => {
              router.push('/(tabs)/cart');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Login Required',
      'Please sign in to access all features and save your preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => {
          // This would navigate to login screen
          Alert.alert('Login', 'Login screen would open here. This demo shows the grocery app functionality.');
        }}
      ]
    );
  };

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text 
        style={styles.categoryName}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productItem, index % 2 === 1 && styles.productItemRight]}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        onAddToCart={() => handleAddToCart(item)}
      />
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading fresh products..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeFilters ? `Products (${filteredProducts.length})` : 'Featured Products'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            scrollEnabled={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleMyOrders}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="My Orders"
              accessibilityHint="View your order history and track current orders"
            >
              <Text style={styles.quickActionEmoji}>📦</Text>
              <Text style={styles.quickActionText}>My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleFavorites}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Favorites"
              accessibilityHint="View your favorite products"
            >
              <Text style={styles.quickActionEmoji}>❤️</Text>
              <Text style={styles.quickActionText}>Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleOffers}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Offers"
              accessibilityHint="Browse special deals and discounts"
            >
              <Text style={styles.quickActionEmoji}>🏷️</Text>
              <Text style={styles.quickActionText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleSupport}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Support"
              accessibilityHint="Get help and contact customer support"
            >
              <Text style={styles.quickActionEmoji}>📞</Text>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={applyFilters}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliverToText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileContainer: {
    marginLeft: 8,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchPlaceholder: {
    color: colors.textTertiary,
    fontSize: 16,
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.successBackground,
  },
  activeFiltersText: {
    color: colors.successDark,
    fontSize: 14,
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearFiltersText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  section: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    width: 90, // Slightly wider to accommodate text
    height: 95, // Taller to ensure consistent text layout
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between', // Space between emoji and text
    paddingVertical: 12, // Consistent vertical padding
    paddingHorizontal: 8, // Horizontal padding for text
    marginHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 28, // Slightly larger emoji
    marginBottom: 0, // Remove margin, using justifyContent instead
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14, // Consistent line height
    flexShrink: 1, // Allow text to shrink if needed
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  productItemRight: {
    marginLeft: 0,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    height: 90,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  cartButton: {
    position: 'relative',
    padding: 8,
  },

});

// Default export to satisfy Expo Router (this file should be treated as a route)
export default HomeScreen;

