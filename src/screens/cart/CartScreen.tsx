// app/screens/cart/CartScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import priceCalculator from '../../../lib/services/business/priceCalculator';
import { checkSupabaseSession, supabaseLoginUser } from '../../../lib/store/actions/supabaseAuthActions';
import { CartItem, CartSummary, CouponInput } from '../../components/cart';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';
import Modal from '../../components/common/Modal';
import TextInput from '../../components/common/TextInput';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { CartStackParamList } from '../../navigation/navigationTypes';

type CartScreenNavigationProp = NativeStackNavigationProp<CartStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const router = useRouter();
  const auth = useAuth();
  const {isAuthenticated} = auth;
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
    clearAllItems,
  } = useCart();

  // Ensure items is always an array to prevent .reduce errors
  const items = Array.isArray(rawItems) ? rawItems : [];

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    console.log('CartScreen useEffect - authentication state changed:', isAuthenticated);
    if (isAuthenticated) {
      syncCart();
      // Close login modal if it was open
      setShowLoginModal(false);
    }
  }, [isAuthenticated, syncCart]);
  
  // Synchronize authentication state on each screen focus
  useEffect(() => {
    const syncAuthState = () => {
      console.log('Syncing auth state on focus');
      
      // Check Supabase token directly
      const hasSupabaseToken = typeof window !== 'undefined' && window.localStorage && [
        'supabase.auth.token', 
        'sb-access-token', 
        'sb-yvjxgoxrzkcjvuptblri-auth-token'
      ].some(key => window.localStorage.getItem(key));
      
      // If token exists but Redux doesn't show authenticated
      if (hasSupabaseToken && !auth.isAuthenticated) {
        console.log('Token found but Redux state is not authenticated - triggering session check');
        // Force a session check
        dispatch(checkSupabaseSession() as any);
        setLocalAuthChecked(true);
      }
    };

    // Call immediately
    syncAuthState();
    
    // Set up focus listener
    const unsubscribe = navigation.addListener('focus', syncAuthState);
    return () => unsubscribe();
  }, [navigation, dispatch, auth.isAuthenticated]);
  
  // State variable for authentication status and re-renders
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [localAuthChecked, setLocalAuthChecked] = useState(false);
  
  // Handle direct login with Supabase
  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoginLoading(true);
      console.log('Attempting direct login with Supabase');
      
      // Use the credentials from the form
      await dispatch(supabaseLoginUser({
        email,
        password
      }) as any);
      
      console.log('Login dispatch completed');
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoginLoading(false);
    }
  }, [email, password, dispatch]);

  // Simplified auth check with debounce to prevent refresh loops
  useEffect(() => {
    // Function to check auth state without causing refresh loops
    const checkAuthState = () => {
      console.log('CartScreen auth check');
      
      // Only check localStorage once to avoid repeated checks
      if (!localAuthChecked && typeof window !== 'undefined' && window.localStorage) {
        // Check for any Supabase token format
        const hasToken = [
          'supabase.auth.token',
          'sb-access-token',
          'sb-yvjxgoxrzkcjvuptblri-auth-token'
        ].some(key => window.localStorage.getItem(key));
        
        if (hasToken) {
          console.log('Auth token found in localStorage');
          setLocalAuthChecked(true);
        }
      }
    };
    
    // Only run on initial mount
    checkAuthState();
    
    // Add focus listener with debounce
    let focusTimeout: any;
    const focusHandler = () => {
      // Cancel previous timeout if it exists
      if (focusTimeout) clearTimeout(focusTimeout);
      
      // Set new timeout to debounce multiple rapid focus events
      focusTimeout = setTimeout(checkAuthState, 300);
    };
    
    const unsubscribe = navigation.addListener('focus', focusHandler);
    return () => {
      unsubscribe();
      if (focusTimeout) clearTimeout(focusTimeout);
    };
  }, [navigation, localAuthChecked]);
  
  // Remove extra effect that might be causing rerenders
  // We'll log auth state changes in a more controlled way

  const handleCheckout = async () => {
    console.log('Checkout button clicked, items:', items.length, 'authenticated:', isAuthenticated);
    
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    // Check for unavailable items based on stock quantity
    const unavailableItems = items.filter((item: any) => 
      item.product && 
      (item.product.stock_quantity === 0 || 
       typeof item.product.stock_quantity === 'undefined' || 
       item.product.is_active === false)
    );
    
    if (unavailableItems.length > 0) {
      Alert.alert(
        'Items Unavailable',
        `Some items in your cart are currently out of stock. Please remove them to continue.`,
        [
          {text: 'OK'},
        ]
      );
      return;
    }

    // Enhanced auth check that uses multiple sources to verify authentication
    const checkSupabaseToken = () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return [
          'supabase.auth.token',
          'sb-access-token', 
          'sb-yvjxgoxrzkcjvuptblri-auth-token'
        ].some(key => window.localStorage.getItem(key));
      }
      return false;
    };
    
    // Check from multiple sources
    const hasSupabaseToken = checkSupabaseToken();
    const currentAuthState = auth.isAuthenticated || localAuthChecked || hasSupabaseToken;
    
    console.log('Enhanced auth check - Result:', currentAuthState, 
      '(Redux:', auth.isAuthenticated, 
      ', Local storage check:', localAuthChecked, 
      ', Supabase token present:', hasSupabaseToken, ')');
    
    if (!currentAuthState) {
      console.log('User not authenticated from any source, showing login modal');
      // Show our custom login modal instead of navigating away
      setShowLoginModal(true);
      return;
    }
    
    console.log('User is authenticated, proceeding to checkout');

    // All checks passed, navigate to checkout
    console.log('All validations passed, navigating to checkout...');
    
    // Optimized checkout navigation function
    const navigateToCheckout = () => {
      console.log('Navigating to checkout screen with enhanced method');
      
      try {
        // Force bypass TS checking to avoid router typing issues
        const safeRouter = router as any;
        
        // Direct router access with safer error handling
        console.log('Using direct router access for navigation');
        if (typeof safeRouter.push === 'function') {
          safeRouter.push('/checkout');
          console.log('Router navigation executed');
          return true;
        } else {
          console.log('Router push is not a function, trying alternative methods');
        }
      } catch (error) {
        console.log('Safe router navigation failed:', error);
      }
      
      try {
        // Fallback to React Navigation
        console.log('Falling back to React Navigation');
        navigation.navigate('Checkout' as never);
        return true;
      } catch (error) {
        console.log('React Navigation failed:', error);
      }
      
      // Web platform last resort
      if (typeof window !== 'undefined') {
        try {
          console.log('Using direct window.location as last resort');
          window.location.href = '/checkout';
          return true;
        } catch (error) {
          console.log('Web navigation failed:', error);
        }
      }
      
      console.error('All checkout navigation methods failed');
      return false;
    };

    // Try to navigate
    if (!navigateToCheckout()) {
      Alert.alert(
        'Navigation Error',
        'Unable to proceed to checkout. Please try again or restart the app.',
        [{ text: 'OK' }]
      );
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
    // Function to attempt each navigation method in sequence
    const navigateToHome = () => {
      // Method 1: Try router.push (Expo Router) to the correct tabs path
      if (router && typeof router.push === 'function') {
        try {
          router.push('/(tabs)/home' as any);
          console.log('Navigation successful with router.push to /(tabs)/home');
          return true;
        } catch (error) {
          console.error('router.push to /(tabs)/home failed:', error);
        }
      }

      // Method 2: Try navigation.navigate with correct path
      if (navigation && typeof navigation.navigate === 'function') {
        try {
          (navigation as any).navigate('Home');
          console.log('Navigation successful with navigation.navigate to Home');
          return true;
        } catch (error) {
          console.error('navigation.navigate to Home failed:', error);
        }
      }
      
      // Method 3: Try window.location for web platform
      if (typeof window !== 'undefined') {
        try {
          window.location.href = '/';
          console.log('Navigation attempted with window.location to /');
          return true;
        } catch (error) {
          console.error('window.location redirect failed:', error);
        }
      }
      
      // No navigation method worked
      return false;
    };

    // Try to navigate
    if (!navigateToHome()) {
      Alert.alert(
        'Navigation Error',
        'Unable to navigate to home screen. Please try again or restart the app.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderCartItem = ({item}: {item: any}) => {
    // Add availability check for UI display
    const isAvailable = item.product && 
      (item.product.stock_quantity > 0 || item.product.stock_quantity === undefined) && 
      item.product.is_active !== false;
    
    return (
      <CartItem
        item={{...item, isAvailable}}
        onUpdateQuantity={(quantity) => updateItemQuantity(item.id, quantity)}
        onRemove={() => {
          console.log('Removing item from cart:', item.id);
          removeItem(item.id);
        }}
        disabled={loading}
      />
    );
  };

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
                        keyExtractor={(item: any) => item.id}
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
                          onPress: async () => {
                            try {
                              console.log('Clearing all cart items at once');
                              // Use the clearAllItems function from useCart
                              await clearAllItems();
                              
                              // Force rerender the component to reflect cleared cart
                              setReloadTrigger(prev => prev + 1);
                              
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
            <Text style={styles.couponMinOrder}>Min. order: ₹50</Text>
          </View>
          
          <View style={styles.couponCard}>
            <Text style={styles.couponCode}>SAVE20</Text>
            <Text style={styles.couponDescription}>₹20 off</Text>
            <Text style={styles.couponMinOrder}>Min. order: ₹150</Text>
          </View>
          
          <View style={styles.couponCard}>
            <Text style={styles.couponCode}>FREESHIP</Text>
            <Text style={styles.couponDescription}>Free delivery</Text>
            <Text style={styles.couponMinOrder}>Min. order: ₹75</Text>
          </View>
        </View>
      </Modal>
      
      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login to Continue"
      >
        <View style={styles.loginForm}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title="Login"
            onPress={handleLogin}
            loading={loginLoading}
            style={styles.loginButton}
          />
          <Button
            title="Create Account"
            onPress={() => {
              setShowLoginModal(false);
              router.push('/(tabs)/profile');
            }}
            style={styles.createAccountButton}
            textStyle={styles.createAccountText}
            variant="outline"
          />
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
  },
  loginContainer: {
    width: '100%',
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  loginForm: {
    width: '100%',
    paddingVertical: 8,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  createAccountButton: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  createAccountText: {
    color: colors.primary,
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
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