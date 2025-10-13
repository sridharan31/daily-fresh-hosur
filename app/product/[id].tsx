import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Product } from '../../lib/types/product';
import Button from '../../src/components/common/Button';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import ReviewsList from '../../src/components/review/ReviewsList';
import { useCart } from '../../src/hooks/useCart';

const { width } = Dimensions.get('window');

// Mock product data - In real app, this would come from API
const MOCK_PRODUCTS: Record<string, Product> = {
  'veg1': {
    id: 'veg1',
    name: 'Fresh Spinach',
    price: 8.99,
    originalPrice: 10.99,
    unit: 'bunch',
    category: { id: '1', name: 'Fresh Vegetables', image: '', isActive: true },
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
    description: 'Fresh organic spinach leaves, perfect for salads and cooking. Rich in iron, vitamins, and minerals. Our spinach is hand-picked daily from local organic farms to ensure maximum freshness and nutritional value.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'fruit1': {
    id: 'fruit1',
    name: 'Fresh Bananas',
    price: 12.99,
    originalPrice: 15.99,
    unit: 'kg',
    category: { id: '2', name: 'Fresh Fruits', image: '', isActive: true },
    images: [
      'https://via.placeholder.com/400x400/FFE135/000000?text=Banana+1',
      'https://via.placeholder.com/400x400/FFFF00/000000?text=Banana+2',
      'https://via.placeholder.com/400x400/F0E68C/000000?text=Banana+3'
    ],
    stock: 50,
    isOrganic: false,
    tags: ['fresh', 'fruit', 'healthy'],
    isActive: true,
    rating: 4.5,
    reviewCount: 128,
    description: 'Fresh and ripe bananas, perfect for breakfast or snacks. Naturally sweet and packed with potassium, fiber, and essential vitamins. Great for smoothies, baking, or eating fresh.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, getItemQuantity, updateItemQuantity } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const productData = MOCK_PRODUCTS[id || ''] || MOCK_PRODUCTS['fruit1'];
      setProduct(productData);
      
      // Check if already in cart
      const cartQuantity = getItemQuantity(productData.id);
      if (cartQuantity > 0) {
        setQuantity(cartQuantity);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Error', 'Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
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
    } finally {
      setAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!product || newQuantity < 1) return;
    
    setQuantity(newQuantity);
    
    // If already in cart, update cart quantity
    const cartQuantity = getItemQuantity(product.id);
    if (cartQuantity > 0) {
      try {
        await updateItemQuantity(product.id, newQuantity);
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In real app, this would sync with backend
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product?.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const renderImageCarousel = () => {
    if (!product?.images?.length) return null;

    return (
      <View style={styles.imageCarousel}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
        >
          {product.images.map((image: string, index: number) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* Image Indicators */}
        {product.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {product.images.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={isFavorite ? '#F44336' : '#666'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Product not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
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
        
        <Text style={styles.headerTitle}>Product Details</Text>
        
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        {renderImageCarousel()}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productUnit}>Per {product.unit}</Text>
            
            {/* Badges */}
            <View style={styles.badges}>
              {product.isOrganic && (
                <View style={styles.organicBadge}>
                  <Text style={styles.organicText}>ORGANIC</Text>
                </View>
              )}
              
              {getDiscountPercentage() > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{getDiscountPercentage()}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>
                {product.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>
                ({product.reviewCount} reviews)
              </Text>
            </View>
            
            <TouchableOpacity onPress={() => router.push(`/reviews/${product.id}` as any)}>
              <Text style={styles.readReviews}>Read Reviews</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockSection}>
            {product.stock > 0 ? (
              <View style={styles.inStockContainer}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.inStockText}>
                  In Stock ({product.stock} available)
                </Text>
              </View>
            ) : (
              <View style={styles.outOfStockContainer}>
                <Icon name="cancel" size={16} color="#F44336" />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Preview */}
          <View style={styles.reviewsPreviewSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <TouchableOpacity onPress={() => router.push(`/reviews/${product.id}` as any)}>
                <Text style={styles.viewAllReviews}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewsPreview}>
              <ReviewsList
                product={product}
                currentUserId="user123"
                showAddReviewButton={false}
                maxHeight={300}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Icon name="remove" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(quantity + 1)}
            >
              <Icon name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={`Add to Cart • ${formatPrice(product.price * quantity)}`}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={product.stock === 0}
          style={styles.addToCartButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  imageCarousel: {
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  productInfo: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  organicBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organicText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  readReviews: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockSection: {
    marginBottom: 20,
  },
  inStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inStockText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outOfStockText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  quantitySection: {
    marginRight: 16,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  quantityValue: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 20,
  },
  errorButton: {
    minWidth: 120,
  },
  reviewsPreviewSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllReviews: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  reviewsPreview: {
    minHeight: 200,
  },
});