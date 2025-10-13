// app/screens/cart/CartScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { router } from 'expo-router';
import priceCalculator from '../../../lib/services/business/priceCalculator';
import { CartItem, CartSummary, CouponInput } from '../../components/cart';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { CartStackParamList } from '../../navigation/navigationTypes';

type CartScreenNavigationProp = NativeStackNavigationProp<CartStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const {isAuthenticated} = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    items: rawItems,
    subtotal,
    deliveryCharge,
    discount,
    vatAmount,
    total,
    itemCount,
    loading,
    error,
    appliedCoupon,
    updateItemQuantity,
    removeItem,
    applyCoupon,
    removeCouponCode,
    syncCart,
  } = useCart();

  // Ensure items is always an array to prevent .reduce errors
  const items = Array.isArray(rawItems) ? rawItems : [];

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated, syncCart]);

  const handleCheckout = async () => {
    console.log('Checkout button clicked, items:', items.length, 'authenticated:', isAuthenticated);
    
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    // Check for unavailable items - assuming isAvailable is on the product
    const unavailableItems = items.filter((item: any) => item.product && !item.product.isAvailable);
    if (unavailableItems.length > 0) {
      Alert.alert(
        'Items Unavailable',
        `Some items in your cart are currently unavailable. Please remove them to continue.`,
        [
          {text: 'OK'},
        ]
      );
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to continue with checkout.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Login', onPress: () => router.replace('/')},
        ]
      );
      return;
    }

    // All checks passed, navigate to checkout
    console.log('All validations passed, navigating to checkout...');
    console.log('Router available:', !!router);
    console.log('Router push function:', typeof router.push);
    
    try {
      // Try immediate navigation
      console.log('Calling router.push(\"/checkout\")...');
      const result = router.push('/checkout');
      console.log('Router.push returned:', result);
      console.log('Navigation to checkout completed successfully');
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Fallback navigation methods
      console.log('Trying fallback navigation methods...');
      
      try {
        // Try using window.location for web
        if (typeof window !== 'undefined') {
          console.log('Using window.location fallback...');
          window.location.href = '/checkout';
          return;
        }
        
        // Try using router.replace instead of push
        console.log('Trying router.replace...');
        router.replace('/checkout');
      } catch (fallbackError) {
        console.error('All navigation methods failed:', fallbackError);
        Alert.alert('Navigation Error', 'Unable to navigate to checkout. Please try again.');
      }
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponLoading(true);
    try {
      await applyCoupon(code);
      setShowCouponModal(false);
    } catch (error: any) {
      throw error;
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCouponCode();
  };

  const handleContinueShopping = () => {
    (navigation as any).navigate('HomeTab');
  };

  const renderCartItem = ({item}: {item: any}) => (
    <CartItem
      item={item}
      onUpdateQuantity={(quantity) => updateItemQuantity(item.id, quantity)}
      onRemove={() => removeItem(item.id)}
      disabled={loading}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Browse our categories and discover our best deals!
      </Text>
      <Button
        title="Start Shopping"
        onPress={handleContinueShopping}
        style={styles.continueButton}
      />
    </View>
  );

  if (loading && items.length === 0) {
    return <LoadingScreen message="Loading your cart..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {items.length === 0 ? renderEmptyCart() : (
        <View style={styles.contentContainer}>
          {/* Cart Items List */}
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsListContent}
          />

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Coupon Input */}
              <CouponInput
                appliedCoupon={appliedCoupon}
                loading={couponLoading}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                disabled={loading}
              />

              {/* Cart Summary */}
              <CartSummary
                cart={{
                  items,
                  itemCount,
                  subtotal,
                  discount,
                  deliveryCharge,
                  vatAmount,
                  total,
                  totalAmount: total,
                  appliedCoupon,
                  coupon: appliedCoupon,
                  isLoading: loading,
                  error,
                }}
                showDeliveryInfo={true}
                onDeliveryInfoPress={() => {
                  Alert.alert(
                    'Delivery Information',
                    `Free delivery on orders above ${priceCalculator.formatPrice(500)}.\n\nStandard delivery: ₹25\nExpress delivery: ₹50`,
                    [{text: 'OK'}]
                  );
                }}
                onCouponPress={() => setShowCouponModal(true)}
                showCouponSection={false} // We're showing it separately above
              />

              {/* Checkout Button */}
              <Button
                title={`Proceed to Checkout • ${priceCalculator.formatPrice(total)}`}
                onPress={handleCheckout}
                style={styles.checkoutButton}
                disabled={!Array.isArray(items) || items.length === 0 || loading}
                loading={loading}
                size="large"
              />

              {/* Continue Shopping */}
              <Button
                title="Continue Shopping"
                onPress={handleContinueShopping}
                variant="outline"
                style={styles.continueShoppingButton}
              />

              {/* Clear Cart Button - Only show when there are items */}
              {Array.isArray(items) && items.length > 0 && (
                <Button
                  title="Clear Cart"
                  onPress={() => {
                    console.log('Clear cart clicked, items:', items?.length || 0);
                    const safeItems = Array.isArray(items) ? items : [];
                    
                    Alert.alert(
                      'Clear Cart',
                      `Are you sure you want to remove all ${safeItems.length} items from your cart?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Clear All', 
                          style: 'destructive',
                          onPress: () => {
                            try {
                              console.log('Clearing cart items:', safeItems.length);
                              // Clear all items safely
                              safeItems.forEach((item: any, index: number) => {
                                console.log(`Removing item ${index + 1}:`, item.id);
                                removeItem(item.id);
                              });
                              
                              Alert.alert(
                                'Cart Cleared',
                                'All items have been removed from your cart.',
                                [{ text: 'OK' }]
                              );
                            } catch (error) {
                              console.error('Error clearing cart:', error);
                              Alert.alert('Error', 'Failed to clear cart. Please try again.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                  variant="outline"
                  style={styles.clearCartButton}
                  textStyle={styles.clearCartButtonText}
                />
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Coupon Modal */}
      <Modal
        visible={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Apply Coupon"
      >
        <CouponInput
          appliedCoupon={appliedCoupon}
          loading={couponLoading}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          disabled={loading}
        />
        
        {/* Available Coupons */}
        <View style={styles.availableCoupons}>
          <Text style={styles.availableCouponsTitle}>Available Coupons</Text>
          
          <View style={styles.couponCard}>
            <Text style={styles.couponCode}>WELCOME10</Text>
            <Text style={styles.couponDescription}>10% off on first order</Text>
            <Text style={styles.couponMinOrder}>Min. order: AED 50</Text>
          </View>
          
          <View style={styles.couponCard}>
            <Text style={styles.couponCode}>SAVE20</Text>
            <Text style={styles.couponDescription}>AED 20 off</Text>
            <Text style={styles.couponMinOrder}>Min. order: AED 150</Text>
          </View>
          
          <View style={styles.couponCard}>
            <Text style={styles.couponCode}>FREESHIP</Text>
            <Text style={styles.couponDescription}>Free delivery</Text>
            <Text style={styles.couponMinOrder}>Min. order: AED 75</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: colors.textOnPrimary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    paddingHorizontal: 32,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  bottomSection: {
    backgroundColor: colors.surface,
    paddingTop: 8,
    maxHeight: '60%',
  },
  checkoutButton: {
    margin: 16,
    marginBottom: 8,
  },
  continueShoppingButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  clearCartButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  clearCartButtonText: {
    color: '#ff4444',
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  availableCoupons: {
    marginTop: 20,
  },
  availableCouponsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  couponMinOrder: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default CartScreen;