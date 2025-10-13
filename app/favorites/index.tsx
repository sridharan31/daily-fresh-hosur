import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Product } from '../../lib/types/product';
import ProductCard from '../../src/components/product/ProductCard';
import { useCart } from '../../src/hooks/useCart';
import { useTheme } from '../../src/hooks/useTheme';

// Mock favorite products - In real app, this would come from user preferences
const FAVORITE_PRODUCTS: Product[] = [
  {
    id: 'fav1',
    name: 'Organic Bananas',
    price: 15.99,
    originalPrice: 18.99,
    unit: 'kg',
    category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
    images: ['https://via.placeholder.com/200x200/FFE135/000000?text=Banana'],
    stock: 50,
    isOrganic: true,
    tags: ['organic', 'fruit', 'healthy', 'premium'],
    isActive: true,
    rating: 4.8,
    reviewCount: 256,
    description: 'Certified organic bananas, grown without pesticides.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fav2',
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
    description: 'Fresh organic spinach leaves, perfect for salads.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function FavoritesScreen() {
  const { addItem } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [favorites, setFavorites] = useState<Product[]>(FAVORITE_PRODUCTS);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]' as any,
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      await addItem(product, quantity);
      // Show success feedback
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFavorite = (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productContainer, index % 2 === 1 && styles.productContainerRight]}>
      <ProductCard
        product={item}
        onPress={handleProductPress}
        onAddToCart={handleAddToCart}
        variant="grid"
        style={styles.productCard}
        isFavorite={true}
        onToggleFavorite={() => handleRemoveFavorite(item.id)}
      />
    </View>
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
        
        <Text style={styles.headerTitle}>My Favorites</Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Add products to favorites by tapping the heart icon
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
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
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});