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
  const handleIncrease = () => {
    if (item.quantity < item.maxQuantity) {
      onUpdateQuantity(item.quantity + 1);
    } else {
      Alert.alert('Stock Limit', `Only ${item.maxQuantity} items available in stock`);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Remove', onPress: onRemove, style: 'destructive'},
        ]
      );
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
            setIsDeleting(true);
            onRemove();
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

  return (
    <View style={[
      styles.container, 
      !item.isAvailable && styles.unavailableContainer,
      isDeleting && styles.deletingContainer
    ]}>
      <Image source={{uri: item.image}} style={styles.image} />
      
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
        
        {!item.isAvailable && (
          <Text style={styles.unavailableText}>Currently unavailable</Text>
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
            disabled={disabled || !item.isAvailable || isDeleting}
          >
            <Icon 
              name="remove" 
              size={20} 
              color={disabled || isDeleting ? colors.textTertiary : colors.primary} 
            />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity
            onPress={handleIncrease}
            style={[styles.quantityButton, (disabled || isDeleting) && styles.disabledButton]}
            disabled={disabled || !item.isAvailable || item.quantity >= item.maxQuantity || isDeleting}
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default CartItem;
