import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';
import orderManagementService from '../lib/supabase/services/orderManagement';
import { userService } from '../lib/supabase/services/user';
import { AppDispatch } from '../lib/supabase/store';
import { loginUser } from '../lib/supabase/store/actions/authActions';
import { clearCart, fetchCart } from '../lib/supabase/store/actions/cartActions';
import { RootState } from '../lib/supabase/store/rootReducer';
import { fromSupabaseAddress } from '../lib/utils/addressUtils';
import CouponInput from '../src/components/cart/CouponInput';
import { useCart } from '../src/hooks/useCart';
import AddressFormModal, { Address } from './components/AddressFormModal';

interface DeliverySlot {
  id: string;
  slot_date: string;
  start_ts: string;
  end_ts: string;
  slot_type: 'weekday' | 'weekend';
  capacity: number;
  booked_count: number;
  status: string;
}

interface DeliveryAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
}

interface GuestCheckoutData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Guest Checkout Form Component
interface GuestCheckoutFormProps {
  onSubmit: (guestData: GuestCheckoutData) => void;
  isLoading: boolean;
}

function GuestCheckoutForm({ onSubmit, isLoading }: GuestCheckoutFormProps) {
  const [formData, setFormData] = useState<GuestCheckoutData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleChange = (field: keyof GuestCheckoutData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <View style={styles.guestFormContainer}>
      <Text style={styles.guestFormTitle}>Guest Checkout</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(val) => handleChange('name', val)}
          placeholder="Full Name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(val) => handleChange('email', val)}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(val) => handleChange('phone', val)}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.address}
          onChangeText={(val) => handleChange('address', val)}
          placeholder="Street Address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(val) => handleChange('city', val)}
            placeholder="City"
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1, { marginHorizontal: 10 }]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(val) => handleChange('state', val)}
            placeholder="State"
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            value={formData.pincode}
            onChangeText={(val) => handleChange('pincode', val)}
            placeholder="PIN"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.primaryButtonText}>Continue to Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function CheckoutScreen() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Check Supabase session directly to ensure we're authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && (!isAuthenticated || !user)) {
        // Restore user in Redux store
        dispatch(loginUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          phone: session.user.phone || session.user.user_metadata?.phone || ''
        }));
      }
    };

    checkSession();
  }, [dispatch, isAuthenticated, user]);

  const cartState = useSelector((state: RootState) => state.cart);
  const {
    items: rawItems,
    subtotal,
    deliveryCharge,
    discount,
    vatAmount,
    total,
    itemCount,
    applyCoupon,
    removeCouponCode,
    appliedCoupon,
    loading: cartLoading
  } = useCart();

  // Process cart items to ensure they have all required properties
  const items = React.useMemo(() => {
    return (rawItems || []).map(item => {
      // Extract product information from the item.product object if available
      const product = (item.product || {}) as any;

      // Calculate item price with fallbacks
      const itemPrice = item.price || product.price || 0;

      // Get discounted price if available
      const discountedPrice = item.discountedPrice ||
        (product.discounted_price ||
          (product.discount_percentage ?
            itemPrice * (1 - product.discount_percentage / 100) :
            undefined));

      // Calculate total price per item
      const totalPrice = (discountedPrice || itemPrice) * item.quantity;

      // Get image URL with fallback
      const imageUrl = item.image ||
        (Array.isArray(product.images) && product.images.length > 0 ?
          product.images[0] : undefined);

      // Return enhanced item
      return {
        ...item,
        name: item.name || product.name_en || product.name || 'Product',
        price: itemPrice,
        discountedPrice: discountedPrice < itemPrice && discountedPrice > 0 ? discountedPrice : undefined,
        totalPrice,
        image: imageUrl,
        unit: item.unit || product.unit || 'each'
      };
    });
  }, [rawItems]);

  // Fetch cart items from Supabase when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, isAuthenticated, user]);

  // State for handling guest checkout
  const [isGuestCheckout, setIsGuestCheckout] = useState(!isAuthenticated);
  const [guestData, setGuestData] = useState<GuestCheckoutData | null>(null);
  const [showGuestLoginOption, setShowGuestLoginOption] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  // Delivery slot state
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotLoading, setSlotLoading] = useState(false);

  // Date picker state (for React Native)
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | undefined>(undefined);

  // Load addresses
  const loadAddresses = async () => {
    if (!user?.id) return;

    setIsAddressLoading(true);

    try {
      const addresses = await userService.getUserAddresses(user.id);

      const mappedAddresses: DeliveryAddress[] = addresses.map((addr) => {
        const formattedAddress = fromSupabaseAddress(addr, user.full_name);
        return {
          id: addr.id,
          type: formattedAddress.type,
          name: formattedAddress.name,
          address: addr.address_line_1 + (addr.address_line_2 ? `, ${addr.address_line_2}` : ''),
          address_line1: addr.address_line_1,
          address_line2: addr.address_line_2,
          landmark: addr.landmark,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          phone: user.phone || '',
          isDefault: addr.is_default
        };
      });

      setSavedAddresses(mappedAddresses);

      // Set selected address to default or first address if exists
      const defaultAddress = mappedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (mappedAddresses.length > 0) {
        setSelectedAddress(mappedAddresses[0].id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setSavedAddresses([]);
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Load addresses from Supabase when component mounts
  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
  }, [user, user?.id]);

  // Load delivery slots when delivery date changes
  useEffect(() => {
    if (deliveryDate) {
      loadDeliverySlots();
    }
  }, [deliveryDate]);

  const loadDeliverySlots = async () => {
    if (!deliveryDate) return;

    try {
      setSlotLoading(true);
      const selectedDate = new Date(deliveryDate);
      const dayOfWeek = selectedDate.getDay();
      const slotType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';

      // First try to fetch existing slots
      let { data, error } = await supabase
        .from('delivery_slot_instances')
        .select('*')
        .eq('slot_date', deliveryDate)
        .eq('slot_type', slotType)
        .eq('status', 'available')
        .order('start_ts');

      // If no slots found, try to generate them
      if (!data || data.length === 0) {
        try {
          const { error: genError } = await supabase.rpc('generate_slot_instances', {
            target_date: deliveryDate
          });

          // Fetch again after generation
          const { data: newData } = await supabase
            .from('delivery_slot_instances')
            .select('*')
            .eq('slot_date', deliveryDate)
            .eq('slot_type', slotType)
            .eq('status', 'available')
            .order('start_ts');

          if (newData) data = newData;
        } catch (e) {
          console.log('Slot generation failed, likely rpc not exists', e);
        }
      }

      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading delivery slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setAddressModalVisible(true);
  };

  const handleEditAddress = (addressId: string) => {
    const addressToEdit = savedAddresses.find(addr => addr.id === addressId);
    if (addressToEdit) {
      const addressForModal: Partial<Address> = {
        id: addressToEdit.id,
        name: addressToEdit.name,
        street: addressToEdit.address_line1 || addressToEdit.address.split(',')[0],
        city: addressToEdit.city,
        state: addressToEdit.state,
        pincode: addressToEdit.pincode,
        phone: addressToEdit.phone,
        type: addressToEdit.type,
        isDefault: addressToEdit.isDefault,
        landmark: addressToEdit.landmark || ""
      };
      setEditingAddress(addressForModal);
      setAddressModalVisible(true);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await userService.deleteAddress(addressId);
              await loadAddresses();
              if (selectedAddress === addressId) {
                setSelectedAddress('');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSaveAddress = async (address: Address) => {
    try {
      setIsLoading(true);

      if (editingAddress && editingAddress.id) {
        await userService.updateAddress(editingAddress.id, address);
      } else {
        await userService.addAddress(address);
      }

      await loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
      setAddressModalVisible(false);
      setEditingAddress(undefined);
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              dispatch(clearCart(isAuthenticated && user ? user.id : 'guest'));
              Alert.alert('Success', 'Cart cleared successfully');
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGuestCheckoutSubmit = (data: GuestCheckoutData) => {
    setGuestData(data);
    setIsGuestCheckout(false);
    setShowGuestLoginOption(true);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoginLoading(true);
    try {
      await dispatch(loginUser({
        email: loginEmail,
        password: loginPassword
      }) as any);

      setShowGuestLoginOption(false);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setShowGuestLoginOption(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && isAuthenticated) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a delivery date and time slot');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      let orderId;

      if (isAuthenticated && user) {
        const orderItems = items.map(item => ({
          product_id: (item as any).product?.id || (item as any).productId || (item as any).product_id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price || item.product?.price || 0
        }));

        if (orderItems.some(i => !i.product_id || isNaN(i.price))) {
          throw new Error("Invalid cart items: Missing product ID or invalid price.");
        }

        const addressData = savedAddresses.find(addr => addr.id === selectedAddress);
        if (!addressData) throw new Error('Selected address not found');

        const deliveryAddress: any = {
          address_line_1: addressData.address_line1 || addressData.address.split(',')[0],
          address_line_2: addressData.address_line2 || "",
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          landmark: addressData.landmark || "",
          phone: addressData.phone || user.phone || ""
        };

        const order = await orderManagementService.createOrder({
          user_id: user.id,
          items: orderItems,
          delivery_address: deliveryAddress as any,
          payment_method: paymentMethod,
          delivery_slot_instance_id: selectedSlot,
          delivery_instructions: specialInstructions
        });

        orderId = order.id;
      } else {
        // Guest checkout
        orderId = 'guest-' + Date.now().toString();

        const guestOrder = {
          id: orderId,
          items,
          guestAddress: guestData,
          paymentMethod,
          specialInstructions,
          pricing: { subtotal, deliveryCharge, discount, vatAmount, total },
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Use AsyncStorage instead of localStorage
        await AsyncStorage.setItem(`guest_order_${orderId}`, JSON.stringify(guestOrder));
      }

      dispatch(clearCart(isAuthenticated && user ? user.id : 'guest'));
      await AsyncStorage.setItem('last_order_id', orderId);

      router.replace({
        pathname: '/order-confirmation',
        params: { orderId }
      });
    } catch (error) {
      console.error('Order placement failed:', error);
      let errorMessage = 'Failed to place order.';
      if (error instanceof Error) errorMessage = error.message;
      setOrderError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to handle date selection
  const handleDateChange = (dateString: string) => {
    setDeliveryDate(dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Address Form Modal */}
      <AddressFormModal
        visible={addressModalVisible}
        onClose={() => !isLoading && setAddressModalVisible(false)}
        onSave={handleSaveAddress}
        isSubmitting={isLoading}
        initialData={editingAddress}
        isEdit={!!editingAddress}
      />

      {/* Guest Login Option Modal */}
      <Modal visible={showGuestLoginOption} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create an Account</Text>
            <Text style={styles.modalText}>
              Would you like to create an account for easier checkout next time?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={loginEmail || (guestData?.email || '')}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flex1, { marginRight: 8 }]}
                onPress={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.outlineButton, styles.flex1]}
                onPress={handleContinueAsGuest}
              >
                <Text style={styles.outlineButtonText}>Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Error Message */}
        {orderError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{orderError}</Text>
            <TouchableOpacity onPress={() => setOrderError(null)}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {isGuestCheckout ? (
          <GuestCheckoutForm onSubmit={handleGuestCheckoutSubmit} isLoading={isLoading} />
        ) : (
          <>
            {/* Order Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {items.length > 0 && (
                  <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearCartText}>Clear Cart</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Cart Items */}
              {cartState.isLoading ? (
                <ActivityIndicator style={{ padding: 20 }} />
              ) : items.length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty.</Text>
              ) : (
                items.map((item: any) => (
                  <View key={item.id} style={styles.cartItem}>
                    <Image
                      source={{ uri: item.image || 'https://via.placeholder.com/50' }}
                      style={styles.cartImage}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.cartItemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        ₹{(item.price || 0).toFixed(2)} × {item.quantity} {item.unit}
                      </Text>
                      {item.discountedPrice && (
                        <Text style={styles.originalPrice}>₹{item.price.toFixed(2)}</Text>
                      )}
                    </View>
                    <Text style={styles.cartItemTotal}>
                      ₹{(item.totalPrice).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}

              {/* Totals */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                  <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Charges</Text>
                  <Text style={styles.summaryValue}>₹{deliveryCharge.toFixed(2)}</Text>
                </View>
                {discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount</Text>
                    <Text style={[styles.summaryValue, styles.discountText]}>-₹{discount.toFixed(2)}</Text>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Taxes & Fees</Text>
                  <Text style={styles.summaryValue}>₹{vatAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Promo Code / Coupon Section */}
            <CouponInput
              appliedCoupon={appliedCoupon}
              loading={cartLoading}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCouponCode}
            />

            {/* Delivery Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.headerButtons}>
                  <TouchableOpacity onPress={() => loadAddresses()} style={{ marginRight: 10 }}>
                    <Ionicons name="refresh" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddAddress}>
                    <Ionicons name="add-circle" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>

              {isAddressLoading ? (
                <ActivityIndicator style={{ padding: 20 }} />
              ) : savedAddresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No addresses found.</Text>
                  <TouchableOpacity style={styles.outlineButton} onPress={handleAddAddress}>
                    <Text style={styles.outlineButtonText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                savedAddresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      selectedAddress === address.id && styles.addressCardSelected
                    ]}
                    onPress={() => setSelectedAddress(address.id)}
                  >
                    <View style={styles.addressHeader}>
                      <View style={styles.addressTypeContainer}>
                        <Ionicons
                          name={address.type === 'home' ? 'home' : address.type === 'work' ? 'business' : 'location'}
                          size={16}
                          color="#555"
                        />
                        <Text style={styles.addressTypeName}>{address.name}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.addressActions}>
                        <TouchableOpacity onPress={() => handleEditAddress(address.id)} style={{ marginRight: 10 }}>
                          <Ionicons name="create-outline" size={20} color="#2196F3" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteAddress(address.id)}>
                          <Ionicons name="trash-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.addressText}>{address.address}</Text>
                    <Text style={styles.addressSubText}>
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                    {address.landmark ? (
                      <Text style={styles.addressSubText}>Landmark: {address.landmark}</Text>
                    ) : null}
                    <Text style={styles.addressSubText}>Phone: {address.phone}</Text>

                    {selectedAddress === address.id && (
                      <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Delivery Slot */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Slot</Text>

              <Text style={styles.label}>Select Date</Text>
              {/* Simple Date Input for now as DateTimePicker requires native setup */}
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={deliveryDate}
                onChangeText={handleDateChange}
              />
              <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2023-12-25)</Text>

              {deliveryDate ? (
                <View style={{ marginTop: 15 }}>
                  <Text style={[styles.label, { marginBottom: 10 }]}>Select Time Slot</Text>
                  {slotLoading ? (
                    <ActivityIndicator />
                  ) : availableSlots.length === 0 ? (
                    <Text style={styles.warningText}>No slots available for this date.</Text>
                  ) : (
                    <View style={styles.slotsGrid}>
                      {availableSlots.map((slot) => {
                        const startTime = new Date(slot.start_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const endTime = new Date(slot.end_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isFull = slot.booked_count >= slot.capacity;

                        return (
                          <TouchableOpacity
                            key={slot.id}
                            style={[
                              styles.slotCard,
                              selectedSlot === slot.id && styles.slotCardSelected,
                              isFull && styles.slotCardDisabled
                            ]}
                            onPress={() => !isFull && setSelectedSlot(slot.id)}
                            disabled={isFull}
                          >
                            <Text style={[
                              styles.slotTime,
                              selectedSlot === slot.id && styles.slotTimeSelected
                            ]}>
                              {startTime} - {endTime}
                            </Text>
                            <Text style={styles.slotStatus}>
                              {isFull ? 'Full' : `${slot.capacity - slot.booked_count} left`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'online' && styles.paymentCardSelected
                ]}
                onPress={() => setPaymentMethod('online')}
              >
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentIcon}>💳</Text>
                  <Text style={styles.paymentLabel}>Online Payment</Text>
                  {paymentMethod === 'online' && <Ionicons name="radio-button-on" size={20} color="#4CAF50" />}
                  {paymentMethod !== 'online' && <Ionicons name="radio-button-off" size={20} color="#ccc" />}
                </View>
                <Text style={styles.paymentDesc}>Pay using UPI, Cards, Net Banking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'cash' && styles.paymentCardSelected
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentIcon}>💵</Text>
                  <Text style={styles.paymentLabel}>Cash on Delivery</Text>
                  {paymentMethod === 'cash' && <Ionicons name="radio-button-on" size={20} color="#4CAF50" />}
                  {paymentMethod !== 'cash' && <Ionicons name="radio-button-off" size={20} color="#ccc" />}
                </View>
                <Text style={styles.paymentDesc}>Pay cash upon delivery</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special instructions for delivery..."
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {!isGuestCheckout && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View>
              <Text style={styles.footerTotalLabel}>Total Payble</Text>
              <Text style={styles.footerTotalAmount}>₹{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                (isLoading || !selectedAddress || !selectedSlot || items.length === 0) && styles.disabledButton
              ]}
              onPress={handlePlaceOrder}
              disabled={isLoading || !selectedAddress || !selectedSlot || items.length === 0}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.placeOrderText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearCartText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },

  // Cart Items
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#666',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },

  // Summary
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // Address
  addressCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    position: 'relative',
  },
  addressCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f9fdf9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeName: {
    fontWeight: 'bold',
    marginLeft: 6,
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#1890ff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addressSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },

  // Slots
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  slotCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  slotCardDisabled: {
    borderColor: '#eee',
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  slotTimeSelected: {
    color: '#4CAF50',
  },
  slotStatus: {
    fontSize: 12,
    color: '#666',
  },
  warningText: {
    color: '#ff9800',
    fontStyle: 'italic',
  },

  // Payment
  paymentCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  paymentCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDesc: {
    fontSize: 13,
    color: '#666',
    marginLeft: 34,
  },

  // Inputs
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  // Footer
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotalLabel: {
    fontSize: 12,
    color: '#666',
  },
  footerTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },

  // Guest Form
  guestFormContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  guestFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#333',
    fontWeight: '600',
  },

  // Error
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  dismissText: {
    color: '#757575',
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});