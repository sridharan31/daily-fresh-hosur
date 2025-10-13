// src/screens/reviews/ProductReviewsScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../lib/types/product';
import ReviewFilters from '../../components/review/ReviewFilters';
import ReviewsList from '../../components/review/ReviewsList';
import ReviewStats from '../../components/review/ReviewStats';
import { useThemeContext } from '../../contexts/ThemeContext';
import useReviews from '../../hooks/useReviews';

// Mock product data - in real app, this would come from API or route params
const MOCK_PRODUCT: Product = {
  id: 'veg1',
  name: 'Organic Spinach',
  description: 'Fresh organic spinach leaves, perfect for salads and cooking.',
  price: 15.99,
  originalPrice: 18.99,
  unit: 'kg',
  category: { id: '1', name: 'Fresh Vegetables', image: '', isActive: true },
  subCategory: 'Leafy Greens',
  images: [
    'https://via.placeholder.com/400x400/228B22/FFFFFF?text=Spinach+1',
    'https://via.placeholder.com/400x400/32CD32/FFFFFF?text=Spinach+2',
    'https://via.placeholder.com/400x400/006400/FFFFFF?text=Spinach+3'
  ],
  stock: 45,
  isOrganic: true,
  tags: ['fresh', 'vegetable', 'organic', 'leafy'],
  isActive: true,
  rating: 4.7,
  reviewCount: 89,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function ProductReviewsScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  
  // In real implementation, fetch product from API using productId
  const product = MOCK_PRODUCT;
  
  const [showStats, setShowStats] = useState(true);
  const [currentUserId] = useState('user123'); // Mock user ID

  const {
    stats,
    filters,
    updateFilters,
  } = useReviews({ productId: product.id });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
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
    },
    toggleStatsButton: {
      padding: 8,
    },
    productInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    productRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    content: {
      flex: 1,
    },
    statsContainer: {
      backgroundColor: colors.background,
    },
    reviewsContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  });

  const getRatingCounts = (): { [key: number]: number } | undefined => {
    if (!stats) return undefined;
    return {
      5: stats.ratingDistribution[5],
      4: stats.ratingDistribution[4],
      3: stats.ratingDistribution[3],
      2: stats.ratingDistribution[2],
      1: stats.ratingDistribution[1],
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Reviews</Text>
        
        <TouchableOpacity
          style={styles.toggleStatsButton}
          onPress={() => setShowStats(!showStats)}
        >
          <Icon 
            name={showStats ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)} ({product.reviewCount})
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Review Statistics */}
        {showStats && stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Rating Breakdown</Text>
            <View style={{ paddingHorizontal: 16 }}>
              <ReviewStats stats={stats} />
            </View>
          </View>
        )}

        {/* Filters */}
        {stats && (
          <ReviewFilters
            filters={filters}
            onFiltersChange={updateFilters}
            totalReviews={stats.totalReviews}
            ratingCounts={getRatingCounts()}
          />
        )}

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          <ReviewsList
            product={product}
            currentUserId={currentUserId}
            showAddReviewButton={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}