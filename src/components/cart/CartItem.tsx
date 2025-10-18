 // app/components/cart/CartItem.tsx
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import priceCalculator from '../../../lib/services/business/priceCalculator';
import { CartItem as CartItemType } from '../../../lib/types/cart';
import { useTheme } from '../../hooks/useTheme';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isDeleting, setIsDeleting] = useState(false);
  // Track recent quantity change for visual feedback
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  
  // Simple visual feedback for quantity changes
  const showUpdateFeedback = () => {
    setRecentlyUpdated(true);
    
    // Reset feedback after a short delay
    setTimeout(() => {
      setRecentlyUpdated(false);
    }, 500);
  };
  
  const handleIncrease = () => {
    if (item.quantity < (item.maxQuantity || 10)) {
      // Visual feedback before update
      const newQuantity = item.quantity + 1;
      
      // Trigger visual feedback
      showUpdateFeedback();
      
      // Apply the update with optimistic UI update
      onUpdateQuantity(newQuantity);
      
      console.log(`Quantity increased to ${newQuantity}`);
    } else {
      Alert.alert('Stock Limit', `Only ${item.maxQuantity || 'a limited number of'} items available in stock`);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      // Show visual feedback when changing quantity
      const originalQuantity = item.quantity;
      
      // Trigger visual feedback
      showUpdateFeedback();
      
      // Apply the update
      onUpdateQuantity(item.quantity - 1);
      
      // Log for debugging
      console.log(`Quantity updated: ${originalQuantity} -> ${item.quantity - 1}`);
    } else {
      // Directly remove item when quantity is 1
      onRemove();
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from cart?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove', 
          onPress: () => {
            console.log('Removing item via Alert confirm');
            setIsDeleting(true);
            // Add a small delay to show the deleting state
            setTimeout(() => {
              onRemove();
            }, 300);
          }, 
          style: 'destructive'
        },
      ]
    );
  };

  const handleQuickRemove = () => {
    setIsDeleting(true);
    onRemove();
  };

  const currentPrice = item.discountedPrice || item.price;
  const totalPrice = currentPrice * item.quantity;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  // Check product availability from either direct property or product data
  const isProductAvailable = (
    // Check explicit isAvailable flag if set
    item.isAvailable !== false && 
    // If product data exists, check stock quantity and active status
    (!item.product || (
      // Product with stock_quantity > 0 is available
      ((item.product as any).stock_quantity > 0 || (item.product as any).stock_quantity === undefined) && 
      // Product must not be explicitly inactive
      (item.product as any).is_active !== false
    ))
  );

  return (
    <View style={[
      styles.container, 
      !isProductAvailable && styles.unavailableContainer,
      isDeleting && styles.deletingContainer
    ]}>
      <Image source={{uri: item.image}} style={styles.image} />
      
      {/* Show stock quantity if available */}
      {(item.product && (item.product as any).stock_quantity > 0) && (
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>{(item.product as any).stock_quantity} in stock</Text>
        </View>
      )}
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        
        <Text style={styles.unit}>{item.unit}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {priceCalculator.formatPrice(currentPrice)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              {priceCalculator.formatPrice(item.price)}
            </Text>
          )}
        </View>
        
        {!isProductAvailable && (
          <Text style={styles.unavailableText}>
            {item.product && (item.product as any).stock_quantity === 0 ? 'Out of stock' : 'Currently unavailable'}
          </Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleRemove}
          style={[
            styles.removeButton,
            isDeleting && styles.removeButtonDeleting
          ]}
          disabled={disabled || isDeleting}
        >
          <Icon 
            name={isDeleting ? "hourglass-empty" : "delete"} 
            size={20} 
            color={isDeleting ? colors.textInverse : colors.error} 
          />
        </TouchableOpacity>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={handleDecrease}
            style={[styles.quantityButton, (disabled || isDeleting) && styles.disabledButton]}
            disabled={disabled || !isProductAvailable || isDeleting}
          >
            <Icon 
              name="remove" 
              size={20} 
              color={disabled || isDeleting ? colors.textTertiary : colors.primary} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.quantity, recentlyUpdated && styles.updatedQuantity]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity
            onPress={handleIncrease}
            style={[styles.quantityButton, (disabled || isDeleting) && styles.disabledButton]}
            disabled={disabled || !isProductAvailable || (item.quantity >= (item.maxQuantity || 10)) || isDeleting}
          >
            <Icon 
              name="add" 
              size={20} 
              color={disabled || isDeleting ? colors.textTertiary : colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.totalPrice}>
          {priceCalculator.formatPrice(totalPrice)}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.success + '33', // 20% opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: 'bold',
  },
  unavailableContainer: {
    opacity: 0.6,
    backgroundColor: colors.backgroundSecondary,
  },
  deletingContainer: {
    opacity: 0.5,
    backgroundColor: colors.errorLight,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  unavailableText: {
    fontSize: 12,
    color: colors.error,
    fontStyle: 'italic',
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.errorLight,
  },
  removeButtonDeleting: {
    backgroundColor: colors.error,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.borderLight,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  updatedQuantity: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default CartItem;
