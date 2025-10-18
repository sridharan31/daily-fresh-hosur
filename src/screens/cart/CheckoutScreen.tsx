import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import supabaseOrderService from '../../../lib/services/api/supabaseOrderService';
import AddressFormModal from '../../components/address/AddressFormModal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { useCartEnhanced } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'wallet' | 'upi';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const cart = useCartEnhanced();
  const { placeOrder, loading: orderLoading } = useOrders();

  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Mock addresses - in real app, fetch from user profile
  const userAddresses: DeliveryAddress[] = [
    {
      id: '1',
      label: 'Home',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '12345',
      country: 'UAE',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      street: '456 Business Bay',
      apartment: 'Floor 15',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '12346',
      country: 'UAE',
      isDefault: false,
    },
  ];

  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '1234',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: '2',
      type: 'cash',
      isDefault: false,
    },
  ];

  React.useEffect(() => {
    // Set default address and payment method
    const defaultAddress = userAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }

    const defaultPayment = paymentMethods.find(pm => pm.isDefault);
    if (defaultPayment) {
      setSelectedPaymentMethod(defaultPayment);
    }
  }, []);

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address to continue.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select how you would like to pay for this order.');
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add some items before checkout.');
      return;
    }
    
    // Show confirmation dialog before placing the order
    Alert.alert(
      'Confirm Order',
      `You're about to place an order for ₹${cart.total.toFixed(2)}. Would you like to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Place Order',
          onPress: processOrder
        }
      ]
    );
  };
  
  // Separate function to process the order after confirmation
  const processOrder = async () => {
    setIsPlacingOrder(true);

    try {
      if (!selectedAddress || !selectedPaymentMethod) {
        throw new Error('Missing address or payment information');
      }

      // Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        deliveryAddress: {
          id: selectedAddress.id,
          label: selectedAddress.label,
          street: selectedAddress.street,
          apartment: selectedAddress.apartment,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country
        },
        paymentMethod: {
          id: selectedPaymentMethod.id,
          type: selectedPaymentMethod.type,
          last4: selectedPaymentMethod.last4,
          brand: selectedPaymentMethod.brand
        },
        notes: orderNotes,
        subtotal: cart.subtotal,
        deliveryCharge: cart.deliveryCharge,
        discount: cart.discount,
        vatAmount: cart.vatAmount,
        total: cart.total,
        appliedCoupon: cart.appliedCoupon
      };

      // Handle Cash on Delivery directly with Supabase
      if (selectedPaymentMethod?.type === 'cash') {
        try {
          // Use supabaseOrderService directly for Cash on Delivery
          const userId = user?.id;
          if (!userId) {
            throw new Error('User not authenticated');
          }
          
          const result = await supabaseOrderService.createOrder(userId, orderData);
          
          // Clear cart - using a more general approach
          cart.items.forEach(item => {
            cart.removeItem(item.id);
          });
          
          // Navigate to order confirmation
          navigation.navigate('OrderConfirmation' as never);
          
          // Show success message
          Alert.alert(
            'Order Placed Successfully!',
            'Your cash on delivery order has been confirmed.',
            [{ text: 'OK' }]
          );
        } catch (error: any) {
          console.error('Supabase order placement failed:', error);
          Alert.alert(
            'Order Failed',
            `Failed to place order: ${error.message || 'Unknown error'}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        // For other payment methods, use the existing system
        const result = await placeOrder(orderData);
        
        // Clear cart - using a more general approach
        cart.items.forEach(item => {
          cart.removeItem(item.id);
        });
        
        // Navigate to order confirmation
        Alert.alert(
          'Order Placed Successfully!',
          'Your order has been placed and will be delivered soon.',
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Orders' as never),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home' as never),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Order placement failed:', error);
      Alert.alert(
        'Order Failed',
        `Failed to place order: ${error.message || 'Please try again.'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAddressSelect = () => {
    // Create dynamic buttons for each address
    const addressButtons = userAddresses.map(address => ({
      text: `${address.label}: ${address.street}, ${address.city}`,
      onPress: () => {
        setSelectedAddress(address);
        // Show confirmation toast
        console.log(`Selected address: ${address.label}`);
      },
    }));
    
    Alert.alert(
      'Select Delivery Address',
      'Choose where you want your order delivered',
      [
        ...addressButtons,
        { 
          text: '➕ Add New Address',
          onPress: () => {
            setShowAddressModal(true);
          } 
        },
        { text: 'Cancel', style: 'cancel', onPress: () => {} }
      ]
    );
  };

  // Handler for saving a new address
  const handleAddressSave = (addressData: any) => {
    // In a real app, you would save this to the database/state management
    const newAddress: DeliveryAddress = {
      id: (userAddresses.length + 1).toString(),
      label: addressData.label,
      street: addressData.street,
      apartment: addressData.apartment,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      isDefault: false,
    };
    
    // Set the new address as selected
    setSelectedAddress(newAddress);
    
    // Show confirmation toast
    Alert.alert('Success', 'Your new address has been added and selected!');
  };

  const handlePaymentSelect = () => {
    Alert.alert(
      'Select Payment Method',
      'Choose your payment method',
      paymentMethods.map(method => ({
        text: method.type === 'card' ? `Card ending in ${method.last4}` : method.type,
        onPress: () => setSelectedPaymentMethod(method),
      })).concat([{ text: 'Cancel', onPress: () => {} }])
    );
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Checkout" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button
            title="Continue Shopping"
            onPress={() => navigation.goBack()}
            style={styles.continueButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Checkout" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={handleAddressSelect}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.street}
                {selectedAddress.apartment && `, ${selectedAddress.apartment}`}
              </Text>
              <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.addAddressButton} onPress={handleAddressSelect}>
              <Text style={styles.addAddressText}>+ Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Payment Method Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={handlePaymentSelect}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPaymentMethod ? (
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentType}>
                {selectedPaymentMethod.type === 'card' 
                  ? `${selectedPaymentMethod.brand} Card` 
                  : selectedPaymentMethod.type}
              </Text>
              {selectedPaymentMethod.type === 'card' && (
                <Text style={styles.paymentDetails}>
                  **** **** **** {selectedPaymentMethod.last4}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addPaymentButton} 
              onPress={handlePaymentSelect}
            >
              <Text style={styles.addPaymentText}>+ Add Payment Method</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({cart.itemCount})</Text>
            <Text style={styles.summaryValue}>₹{cart.subtotal?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₹{cart.deliveryCharge?.toFixed(2) || '0.00'}</Text>
          </View>
          {cart.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -₹{cart.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT</Text>
            <Text style={styles.summaryValue}>₹{cart.vatAmount?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{cart.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </Card>

        {/* Order Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          <TouchableOpacity
            style={styles.notesInput}
            onPress={() => {
              Alert.prompt(
                'Delivery Instructions',
                'Enter any special delivery instructions:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Save', 
                    onPress: (text: string) => setOrderNotes(text || '') 
                  },
                ],
                'plain-text',
                orderNotes
              );
            }}
          >
            <Text style={[
              styles.notesText,
              !orderNotes && styles.notesPlaceholder
            ]}>
              {orderNotes || 'Add delivery instructions...'}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomSection}>
        <Button
          title={`Place Order • ₹${cart.total?.toFixed(2) || '0.00'}`}
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          loading={isPlacingOrder || orderLoading}
          disabled={!selectedAddress || !selectedPaymentMethod || isPlacingOrder || orderLoading}
          size="large"
        />
      </View>

      {/* Address Form Modal */}
      <AddressFormModal 
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        initialValues={{
          country: 'India',
          city: 'Hosur',
          state: 'Tamil Nadu',
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80, // Add padding at bottom to ensure content isn't hidden behind the Place Order button
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  changeButton: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  addressContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
  },
  addPaymentButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addPaymentText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    backgroundColor: '#f8f9fa',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  notesPlaceholder: {
    color: '#999',
  },
  bottomSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  continueButton: {
    paddingHorizontal: 32,
  },
});

export default CheckoutScreen;

