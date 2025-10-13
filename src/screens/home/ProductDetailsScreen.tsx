import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Product } from '../../../lib/types/product';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { useCartEnhanced } from '../../hooks/useCart';

const { width } = Dimensions.get('window');

const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const cart = useCartEnhanced();
  
  // Get product from route params or use mock data
  const productId = (route.params as any)?.productId;
  
  // Mock product data - in real app, fetch from API
  const [product] = useState<Product>({
    id: productId || '1',
    name: 'Organic Fresh Apples',
    description: 'Premium quality organic apples sourced directly from certified organic farms. These crisp, sweet apples are perfect for snacking, baking, or adding to your favorite recipes. Packed with vitamins, fiber, and antioxidants.',
    price: 15.99,
    originalPrice: 18.99,
    unit: 'kg',
    category: {
      id: '1',
      name: 'Fruits',
      image: '',
      isActive: true,
    },
    subCategory: 'Fresh Fruits',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400',
    ],
    stock: 50,
    isOrganic: true,
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      vitamins: ['Vitamin C', 'Vitamin K', 'Potassium'],
    },
    tags: ['organic', 'fresh', 'local', 'healthy'],
    isActive: true,
    rating: 4.8,
    reviewCount: 124,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      await cart.addItem(product, quantity);
      Alert.alert(
        'Added to Cart',
        `${quantity} ${product.unit} of ${product.name} added to cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart' as never) },
        ]
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    try {
      await cart.addItem(product, quantity);
      navigation.navigate('Cart' as never);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const isInCart = cart.isItemInCart(product.id);
  const cartItem = cart.items.find((item: any) => item.productId === product.id) as any;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Product Details" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {product.isOrganic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>🌱 Organic</Text>
            </View>
          )}
          
          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: image }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.category}>{product.category.name} • {product.subCategory}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>AED {product.price.toFixed(2)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>AED {product.originalPrice.toFixed(2)}</Text>
            )}
            <Text style={styles.unit}>per {product.unit}</Text>
          </View>

          {product.originalPrice && product.originalPrice > product.price && (
            <View style={styles.savingsContainer}>
              <Text style={styles.savings}>
                You save AED {(product.originalPrice - product.price).toFixed(2)}
              </Text>
            </View>
          )}

          <Text style={styles.description}>{product.description}</Text>
        </Card>

        {/* Nutritional Info */}
        {product.nutritionalInfo && (
          <Card style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>Nutritional Information (per 100g)</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.fiber}g</Text>
                <Text style={styles.nutritionLabel}>Fiber</Text>
              </View>
            </View>
            
            {product.nutritionalInfo.vitamins && (
              <View style={styles.vitaminsContainer}>
                <Text style={styles.vitaminsTitle}>Rich in:</Text>
                <Text style={styles.vitamins}>
                  {product.nutritionalInfo.vitamins.join(', ')}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <Card style={styles.tagsCard}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Stock Info */}
        <Card style={styles.stockCard}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <Text style={[
              styles.stockValue,
              product.stock > 10 ? styles.inStock : styles.lowStock
            ]}>
              {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Qty:</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= product.stock && styles.disabledButton]}
              onPress={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={isInCart ? `Update (${cartItem?.quantity || 0})` : 'Add to Cart'}
            onPress={handleAddToCart}
            variant="outline"
            style={styles.addToCartButton}
            disabled={product.stock === 0}
          />
          <Button
            title="Buy Now"
            onPress={handleBuyNow}
            style={styles.buyNowButton}
            disabled={product.stock === 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  mainImage: {
    width,
    height: width * 0.8,
  },
  organicBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  organicText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  unit: {
    fontSize: 14,
    color: '#666',
  },
  savingsContainer: {
    marginBottom: 16,
  },
  savings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  nutritionCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vitaminsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  vitaminsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vitamins: {
    fontSize: 14,
    color: '#666',
  },
  tagsCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
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
    fontWeight: '500',
  },
  stockCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  inStock: {
    color: '#4CAF50',
  },
  lowStock: {
    color: '#ff9800',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
  },
  buyNowButton: {
    flex: 1,
  },
});

export default ProductDetailsScreen;

