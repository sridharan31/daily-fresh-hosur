import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Product } from '../../../lib/types/product';
import Header from '../../components/common/Header';
import LoadingScreen from '../../components/common/LoadingScreen';
import ProductCard from '../../components/product/ProductCard';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'organic apples',
    'fresh vegetables',
    'dairy products',
    'gluten free',
  ]);
  const [popularSearches] = useState<string[]>([
    'bananas',
    'milk',
    'bread',
    'eggs',
    'chicken',
    'tomatoes',
    'yogurt',
    'rice',
  ]);

  // Mock products for search results
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Organic Red Apples',
      description: 'Fresh organic red apples',
      price: 15.99,
      originalPrice: 18.99,
      unit: 'kg',
      category: { id: '1', name: 'Fruits', image: '', isActive: true },
      subCategory: 'Fresh Fruits',
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'],
      stock: 50,
      isOrganic: true,
      tags: ['organic', 'fresh', 'apple'],
      isActive: true,
      rating: 4.8,
      reviewCount: 124,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Fresh Bananas',
      description: 'Sweet and ripe bananas',
      price: 8.50,
      unit: 'kg',
      category: { id: '1', name: 'Fruits', image: '', isActive: true },
      subCategory: 'Fresh Fruits',
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300'],
      stock: 30,
      isOrganic: false,
      tags: ['fresh', 'banana', 'sweet'],
      isActive: true,
      rating: 4.5,
      reviewCount: 89,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Organic Whole Milk',
      description: 'Fresh organic whole milk',
      price: 12.99,
      unit: 'liter',
      category: { id: '2', name: 'Dairy', image: '', isActive: true },
      subCategory: 'Milk',
      images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'],
      stock: 25,
      isOrganic: true,
      tags: ['organic', 'milk', 'dairy'],
      isActive: true,
      rating: 4.7,
      reviewCount: 156,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Whole Wheat Bread',
      description: 'Freshly baked whole wheat bread',
      price: 6.99,
      unit: 'piece',
      category: { id: '3', name: 'Bakery', image: '', isActive: true },
      subCategory: 'Bread',
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'],
      stock: 20,
      isOrganic: false,
      tags: ['bread', 'wheat', 'bakery'],
      isActive: true,
      rating: 4.3,
      reviewCount: 67,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        product.category.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Add to recent searches if not already present
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(item => item !== search));
  };

  const handleProductPress = (product: Product) => {
    // navigation.navigate('ProductDetails', { productId: product.id });
    console.log('Navigate to product:', product.id);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      style={styles.productCard}
    />
  );

  const renderSearchSuggestion = (title: string, items: string[], onPress: (item: string) => void, showRemove = false) => (
    <View style={styles.suggestionSection}>
      <Text style={styles.suggestionTitle}>{title}</Text>
      <View style={styles.suggestionList}>
        {items.map((item, index) => (
          <View key={index} style={styles.suggestionItem}>
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => onPress(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
            {showRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeRecentSearch(item)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Search Products" />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isSearching ? (
          <LoadingScreen />
        ) : searchQuery.trim().length === 0 ? (
          /* Search Suggestions */
          <View style={styles.suggestionsContainer}>
            {recentSearches.length > 0 && 
              renderSearchSuggestion(
                'Recent Searches',
                recentSearches,
                handleRecentSearchPress,
                true
              )
            }
            
            {renderSearchSuggestion(
              'Popular Searches',
              popularSearches,
              handleRecentSearchPress
            )}
          </View>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
            
            <FlatList
              data={searchResults}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </View>
        ) : (
          /* No Results */
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsIcon}>🔍</Text>
            <Text style={styles.noResultsTitle}>No products found</Text>
            <Text style={styles.noResultsSubtitle}>
              Try searching for something else or check your spelling
            </Text>
            
            <View style={styles.noResultsSuggestions}>
              <Text style={styles.suggestionTitle}>Try searching for:</Text>
              <View style={styles.suggestionList}>
                {popularSearches.slice(0, 4).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleRecentSearchPress(item)}
                  >
                    <Text style={styles.suggestionChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionSection: {
    marginBottom: 24,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
    paddingRight: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  noResultsSuggestions: {
    width: '100%',
  },
  suggestionChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchScreen;

