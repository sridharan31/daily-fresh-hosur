import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
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

// Mock data for search - In real app, this would come from API
const ALL_PRODUCTS: Product[] = [
  {
    id: 'search1',
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
    id: 'search2',
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
    id: 'search3',
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
    id: 'search4',
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
  },
  {
    id: 'search5',
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
];

const RECENT_SEARCHES = [
  'Organic Vegetables',
  'Fresh Fruits',
  'Spinach',
  'Apples',
  'Carrots'
];

const POPULAR_SEARCHES = [
  'Organic Bananas',
  'Fresh Spinach',
  'Red Apples',
  'Broccoli',
  'Tomatoes',
  'Lettuce',
  'Strawberries',
  'Oranges'
];

export default function SearchScreen() {
  const { addItem } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filtered = ALL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())) ||
        product.category.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search products. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleSearchItemPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
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

  const renderSearchSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSearchItemPress(item)}
    >
      <Icon name="search" size={16} color="#666" />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

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
        
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <LoadingScreen />
      ) : showResults ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
          
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="search-off" size={64} color="#ccc" />
              <Text style={styles.noResultsTitle}>No products found</Text>
              <Text style={styles.noResultsSubtitle}>
                Try searching with different keywords
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.suggestionsContainer}>
          {/* Recent Searches */}
          <View style={styles.suggestionSection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <FlatList
              data={RECENT_SEARCHES}
              renderItem={renderSearchSuggestion}
              keyExtractor={(item, index) => `recent-${index}`}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Popular Searches */}
          <View style={styles.suggestionSection}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <FlatList
              data={POPULAR_SEARCHES}
              renderItem={renderSearchSuggestion}
              keyExtractor={(item, index) => `popular-${index}`}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
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
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  suggestionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 20,
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
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});