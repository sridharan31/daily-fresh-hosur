 // app/components/cart/CartSummary.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import priceCalculator from '../../../lib/services/business/priceCalculator';
import { CartState } from '../../../lib/types/cart';
import Config from '../../config/environment';

interface CartSummaryProps {
  cart: CartState;
  showDeliveryInfo?: boolean;
  onDeliveryInfoPress?: () => void;
  onCouponPress?: () => void;
  showCouponSection?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  showDeliveryInfo = true,
  onDeliveryInfoPress,
  onCouponPress,
  showCouponSection = true,
}) => {
  const isFreeDeliveryEligible = cart.subtotal >= Config.FREE_DELIVERY_THRESHOLD;
  const amountForFreeDelivery = Config.FREE_DELIVERY_THRESHOLD - cart.subtotal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      
      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
        </Text>
        <Text style={styles.value}>
          {priceCalculator.formatPrice(cart.subtotal)}
        </Text>
      </View>

      {/* Discount */}
      {cart.discount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.discountText]}>
            Discount {cart.appliedCoupon ? `(${cart.appliedCoupon.code})` : ''}
          </Text>
          <Text style={[styles.value, styles.discountText]}>
            -{priceCalculator.formatPrice(cart.discount)}
          </Text>
        </View>
      )}

      {/* Delivery */}
      <View style={styles.row}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.label}>Delivery</Text>
          {showDeliveryInfo && onDeliveryInfoPress && (
            <TouchableOpacity onPress={onDeliveryInfoPress} style={styles.infoButton}>
              <Icon name="info-outline" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.value}>
          {cart.deliveryCharge === 0 ? 'FREE' : priceCalculator.formatPrice(cart.deliveryCharge)}
        </Text>
      </View>

      {/* Free delivery threshold message */}
      {!isFreeDeliveryEligible && amountForFreeDelivery > 0 && (
        <View style={styles.freeDeliveryContainer}>
          <Icon name="local-shipping" size={16} color="#f39c12" />
          <Text style={styles.freeDeliveryText}>
            Add {priceCalculator.formatPrice(amountForFreeDelivery)} more for free delivery
          </Text>
        </View>
      )}

      {isFreeDeliveryEligible && cart.deliveryCharge === 0 && (
        <View style={styles.freeDeliveryContainer}>
          <Icon name="check-circle" size={16} color="#27ae60" />
          <Text style={[styles.freeDeliveryText, {color: '#27ae60'}]}>
            🎉 You qualify for free delivery!
          </Text>
        </View>
      )}

      {/* VAT */}
      <View style={styles.row}>
        <Text style={styles.label}>{priceCalculator.getVATDisplayText()}</Text>
        <Text style={styles.value}>
          {priceCalculator.formatPrice(cart.vatAmount)}
        </Text>
      </View>

      {/* Coupon Section */}
      {showCouponSection && (
        <View style={styles.couponContainer}>
          {cart.appliedCoupon ? (
            <View style={styles.appliedCouponContainer}>
              <Icon name="local-offer" size={16} color="#27ae60" />
              <Text style={styles.appliedCouponText}>
                Coupon "{cart.appliedCoupon.code}" applied
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={onCouponPress} style={styles.couponButton}>
              <Icon name="local-offer" size={16} color="#4CAF50" />
              <Text style={styles.couponButtonText}>Apply Coupon</Text>
              <Icon name="chevron-right" size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Total */}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {priceCalculator.formatPrice(cart.total)}
        </Text>
      </View>

      {/* Savings info */}
      {cart.discount > 0 && (
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsText}>
            🎉 You saved {priceCalculator.formatPrice(cart.discount)} on this order!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#27ae60',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoButton: {
    marginLeft: 4,
    padding: 2,
  },
  freeDeliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  freeDeliveryText: {
    fontSize: 12,
    color: '#f39c12',
    marginLeft: 6,
    flex: 1,
  },
  couponContainer: {
    marginVertical: 8,
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    backgroundColor: '#f8fff8',
  },
  couponButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
  },
  appliedCouponText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingsContainer: {
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
});

export default CartSummary;
