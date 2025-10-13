 
// app/components/product/ProductCard.tsx
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../lib/types/product';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with proper padding to prevent overlap

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (product: Product) => void;
  variant?: 'grid' | 'list';
  isFavorite?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
  variant = 'grid',
  isFavorite = false,
  style,
  testID,
}) => {
  const {addItem, getItemQuantity, isItemInCart} = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isInCart = isItemInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product, quantity);
      } else {
        await addItem(product, quantity);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const renderGridCard = () => (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={() => onPress?.(product)}
      testID={testID}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: product.images[0]}}
          style={styles.productImage}
          resizeMode="cover"
        />
        
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

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite?.(product)}
          testID={`${testID}-favorite`}
        >
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={20}
            color={isFavorite ? '#F44336' : '#666'}
          />
        </TouchableOpacity>

        {/* Stock Status */}
        {product.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.productUnit}>
          Per {product.unit}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>
            {product.rating.toFixed(1)} ({product.reviewCount})
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatPrice(product.price)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>

        {/* Add to Cart Section */}
        {product.stock > 0 && (
          <View style={styles.cartSection}>
            {!isInCart ? (
              <View style={styles.quantityAndAdd}>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <Icon name="remove" size={16} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleIncrement}
                  >
                    <Icon name="add" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <Button
                  title="Add"
                  onPress={handleAddToCart}
                  loading={isLoading}
                  size="small"
                  style={styles.addButton}
                  testID={`${testID}-add-to-cart`}
                />
              </View>
            ) : (
              <View style={styles.inCartIndicator}>
                <Icon name="shopping-cart" size={16} color="#4CAF50" />
                <Text style={styles.inCartText}>
                  {cartQuantity} in cart
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderListCard = () => (
    <TouchableOpacity
      style={[styles.listCard, style]}
      onPress={() => onPress?.(product)}
      testID={testID}
    >
      {/* Product Image */}
      <View style={styles.listImageContainer}>
        <Image
          source={{uri: product.images[0]}}
          style={styles.listProductImage}
          resizeMode="cover"
        />
        
        {/* Badges */}
        {product.isOrganic && (
          <View style={styles.listOrganicBadge}>
            <Text style={styles.organicText}>ORG</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.listProductInfo}>
        <View style={styles.listHeader}>
          <Text style={styles.listProductName} numberOfLines={1}>
            {product.name}
          </Text>
          <TouchableOpacity
            onPress={() => onToggleFavorite?.(product)}
            testID={`${testID}-favorite`}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? '#F44336' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.listProductUnit}>
          Per {product.unit}
        </Text>

        <View style={styles.listRatingPrice}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {product.rating.toFixed(1)}
            </Text>
          </View>

          <View style={styles.listPriceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(product.price)}
            </Text>
            {getDiscountPercentage() > 0 && (
              <Text style={styles.discountPercentage}>
                -{getDiscountPercentage()}%
              </Text>
            )}
          </View>
        </View>

        {/* Stock Status */}
        {product.stock === 0 ? (
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        ) : (
          <View style={styles.listCartSection}>
            {!isInCart ? (
              <Button
                title="Add to Cart"
                onPress={handleAddToCart}
                loading={isLoading}
                size="small"
                style={styles.listAddButton}
                testID={`${testID}-add-to-cart`}
              />
            ) : (
              <View style={styles.inCartIndicator}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.inCartText}>
                  {cartQuantity} in cart
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return variant === 'grid' ? renderGridCard() : renderListCard();
};

const createStyles = (colors: any) => StyleSheet.create({
  // Grid Card Styles
  gridCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    gap: 4,
  },
  organicBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  organicText: {
    color: colors.textOnPrimary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.textOnPrimary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.surfaceTransparent,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    minHeight: 40,
    lineHeight: 20,
  },
  productUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  cartSection: {
    marginTop: 8,
  },
  quantityAndAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 10,
    minWidth: 28,
    textAlign: 'center',
    color: colors.text,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
  inCartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successBackground,
    paddingVertical: 8,
    borderRadius: 6,
  },
  inCartText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 4,
  },

  // List Card Styles
  listCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  listProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listOrganicBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listProductInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  listProductUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  listRatingPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountPercentage: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  listCartSection: {
    alignItems: 'flex-end',
  },
  listAddButton: {
    paddingHorizontal: 16,
  },
});

export default ProductCard;