import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthService } from '../lib/services/authService';
import { AppDispatch, RootState } from '../lib/store';
import { clearCart, fetchCart } from '../lib/store/slices/cartSlice';
import { fromSupabaseAddress, toSupabaseAddress } from '../lib/utils/addressUtils';
import { useCart } from '../src/hooks/useCart';
import AddressFormModal, { Address } from './components/AddressFormModal';

// Web-compatible CSS
if (typeof window !== 'undefined') {
  require('../global.css');
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
}

// Address types defined here instead of mock data
// Addresses will be loaded from Supabase user_addresses table
// Cart items are stored in the cart_items table with the following schema:
// - id: UUID (primary key)
// - user_id: UUID (foreign key to users table)
// - product_id: UUID (foreign key to products table)
// - quantity: INTEGER
// - created_at: TIMESTAMP
// - updated_at: TIMESTAMP
//
// Cart Synchronization Flow:
// 1. When user is authenticated, cart items are fetched from Supabase cart_items table
// 2. Items are stored in Redux state through cartSlice
// 3. The useCart hook provides access to cart items and calculated totals
// 4. Adding/removing items triggers both Redux update and Supabase sync
// 5. RLS policies ensure users can only access their own cart items

export default function CheckoutScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const cartState = useSelector((state: RootState) => state.cart);
  const { items, subtotal, deliveryCharge, discount, vatAmount, total, itemCount } = useCart();
  const dispatch = useDispatch<AppDispatch>();
  
  // Initialize auth service for address operations
  const authService = new AuthService();
  
  // Cart state from Redux store is synchronized with Supabase cart_items table
  
  // Fetch cart items from Supabase when component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  
  // Load addresses from Supabase when component mounts
  useEffect(() => {
    async function loadAddresses() {
      if (!user?.id) return;
      
      setIsAddressLoading(true);
      try {
        const addresses = await authService.getUserAddresses();
        
        // Map the Supabase address format to our DeliveryAddress format
        const mappedAddresses: DeliveryAddress[] = addresses.map((addr: any) => {
          const formattedAddress = fromSupabaseAddress(addr, user.full_name);
          return {
            id: addr.id,
            type: formattedAddress.type,
            name: formattedAddress.name,
            address: addr.address_line_1 + (addr.address_line_2 ? `, ${addr.address_line_2}` : ''),
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
        // Display error but don't set any addresses
        setSavedAddresses([]);
      } finally {
        setIsAddressLoading(false);
      }
    }
    
    loadAddresses();
  }, [user?.id]);
  
  const handleAddAddress = () => {
    // Open the address form modal
    setAddressModalVisible(true);
  };

  const handleSaveAddress = async (address: Address) => {
    try {
      setIsLoading(true);
      
      // Convert to Supabase format using our utility
      const supabaseAddress = toSupabaseAddress(address);
      
      // Save to Supabase
      const savedAddress = await authService.addAddress(supabaseAddress);
      
      if (!savedAddress) {
        throw new Error('Failed to save address');
      }
      
      // Create a new DeliveryAddress from the saved data
      const newAddress: DeliveryAddress = {
        id: savedAddress.id,
        type: address.type,
        name: address.name,
        address: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        isDefault: savedAddress.is_default
      };
      
      // Update local state
      let updatedAddresses;
      
      if (newAddress.isDefault) {
        // Update all addresses to not be default if this one is default
        updatedAddresses = savedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
        updatedAddresses.push(newAddress);
      } else {
        updatedAddresses = [...savedAddresses, newAddress];
      }
      
      setSavedAddresses(updatedAddresses);
      setSelectedAddress(newAddress.id);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
      setAddressModalVisible(false);
    }
  };

  // Clear cart function using hook from useCart
  const handleClearCart = async () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setIsLoading(true);
        // Dispatch the clear cart action
        dispatch(clearCart());
        alert('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Order data preparation
      // In a complete implementation, this would:
      // 1. Create a record in the 'orders' table
      // 2. Create records in the 'order_items' table for each item
      // 3. Clear the user's cart_items from Supabase
      // 4. Record the delivery address from user_addresses
      const orderData = {
        items,
        selectedAddress: savedAddresses.find(addr => addr.id === selectedAddress),
        paymentMethod,
        specialInstructions,
        pricing: {
          subtotal,
          deliveryCharge,
          discount,
          vatAmount,
          total
        }
      };

      console.log('Order placed:', orderData);
      
      // Clear the cart after successful order placement
      dispatch(clearCart());
      
      // Navigate to order confirmation
      router.replace('/order-confirmation');
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAddressData = savedAddresses.find(addr => addr.id === selectedAddress);

  return (
    <div style={styles.container}>
      {/* Address Form Modal */}
      <AddressFormModal 
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={handleSaveAddress}
      />

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBack}>
          <span style={styles.backIcon}>←</span>
        </button>
        <h1 style={styles.headerTitle}>Checkout</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Order Summary */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          
          {/* Cart Items List */}
          <div style={styles.cartItems}>
            <div style={styles.cartHeader}>
              <h3 style={styles.cartTitle}>Cart Items</h3>
              {items.length > 0 && (
                <button 
                  onClick={handleClearCart} 
                  style={styles.clearCartButton}
                  disabled={isLoading}
                >
                  Clear Cart
                </button>
              )}
            </div>
            
            {cartState.isLoading ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>Loading cart items...</p>
              </div>
            ) : items.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>Your cart is empty. Add items to proceed with checkout.</p>
              </div>
            ) : (
              items.map((item: any) => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={styles.cartItemInfo}>
                    <div style={styles.cartItemImage}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{backgroundColor: '#f0f0f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No image</div>
                      )}
                    </div>
                    <div style={styles.cartItemDetails}>
                      <h4 style={styles.cartItemName}>{item.name}</h4>
                      <p style={styles.cartItemPrice}>₹{item.price.toFixed(2)} × {item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <div style={styles.cartItemTotal}>₹{item.totalPrice.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
          
          <div style={styles.orderSummary}>
            <div style={styles.summaryRow}>
              <span>Items ({itemCount})</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span>₹{deliveryCharge.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={styles.summaryRow}>
                <span>Discount</span>
                <span style={styles.discountText}>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Taxes & Fees</span>
              <span>₹{vatAmount.toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalAmount}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Delivery Address</h2>
            <button style={styles.addButton} onClick={handleAddAddress}>
              + Add New
            </button>
          </div>
          <div style={styles.addressList}>
            {isAddressLoading ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>Loading addresses...</p>
              </div>
            ) : savedAddresses.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>No saved addresses found. Add your first address.</p>
              </div>
            ) : (
              savedAddresses.map((address) => (
                <div
                  key={address.id}
                  style={{
                    ...styles.addressCard,
                    ...(selectedAddress === address.id ? styles.addressCardSelected : {})
                  }}
                  onClick={() => setSelectedAddress(address.id)}
                >
                <div style={styles.addressHeader}>
                  <div style={styles.addressType}>
                    <span style={styles.addressIcon}>
                      {address.type === 'home' ? '🏠' : address.type === 'work' ? '🏢' : '📍'}
                    </span>
                    <span style={styles.addressTypeName}>{address.name}</span>
                    {address.isDefault && (
                      <span style={styles.defaultBadge}>Default</span>
                    )}
                  </div>
                  <input
                    type="radio"
                    checked={selectedAddress === address.id}
                    onChange={() => setSelectedAddress(address.id)}
                    style={styles.radioButton}
                  />
                </div>
                <p style={styles.addressText}>{address.address}</p>
                <p style={styles.addressDetails}>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p style={styles.addressPhone}>📞 {address.phone}</p>
              </div>
            )))}
          </div>
        </div>

        {/* Payment Method */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Payment Method</h2>
          <div style={styles.paymentMethods}>
            <div
              style={{
                ...styles.paymentCard,
                ...(paymentMethod === 'online' ? styles.paymentCardSelected : {})
              }}
              onClick={() => setPaymentMethod('online')}
            >
              <div style={styles.paymentHeader}>
                <span style={styles.paymentIcon}>💳</span>
                <span style={styles.paymentLabel}>Online Payment</span>
                <input
                  type="radio"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  style={styles.radioButton}
                />
              </div>
              <p style={styles.paymentDescription}>
                Pay using UPI, Cards, Net Banking or Wallets
              </p>
            </div>
            <div
              style={{
                ...styles.paymentCard,
                ...(paymentMethod === 'cash' ? styles.paymentCardSelected : {})
              }}
              onClick={() => setPaymentMethod('cash')}
            >
              <div style={styles.paymentHeader}>
                <span style={styles.paymentIcon}>💵</span>
                <span style={styles.paymentLabel}>Cash on Delivery</span>
                <input
                  type="radio"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  style={styles.radioButton}
                />
              </div>
              <p style={styles.paymentDescription}>
                Pay when your order is delivered
              </p>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Special Instructions (Optional)</h2>
          <textarea
            style={styles.instructionsInput}
            placeholder="Any special delivery instructions..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <p style={styles.deliveryInfo}>
              🚚 Estimated delivery: 30-45 minutes
            </p>
            <p style={styles.totalInfo}>
              Total: <span style={styles.totalPrice}>₹{total.toFixed(2)}</span>
            </p>
          </div>
          <button
            style={{
              ...styles.placeOrderButton,
              ...((isLoading || !selectedAddress || items.length === 0) ? styles.placeOrderButtonDisabled : {})
            }}
            onClick={handlePlaceOrder}
            disabled={isLoading || !selectedAddress || items.length === 0}
            title={
              !selectedAddress 
                ? 'Please select a delivery address' 
                : items.length === 0 
                ? 'Your cart is empty' 
                : ''
            }
          >
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', 
    flexDirection: 'column' as 'column',
    minHeight: '100vh',
    maxHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
  },
  cartItems: {
    marginBottom: '20px',
    borderRadius: '8px',
    backgroundColor: 'white',
    padding: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  cartTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold' as 'bold',
  },
  clearCartButton: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#ff7875',
    },
    ':disabled': {
      backgroundColor: '#ffccc7',
      cursor: 'not-allowed',
    },
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  cartItemInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  cartItemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginRight: '12px',
    backgroundColor: '#f0f0f0',
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 'bold' as 'bold',
  },
  cartItemPrice: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
  },
  cartItemTotal: {
    fontWeight: 'bold' as 'bold',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    marginRight: '12px',
    borderRadius: '4px',
  },
  backIcon: {
    fontSize: '18px',
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
  },
  content: {
    flex: 1,
    padding: '20px',
    paddingBottom: '120px', // Space for footer
    overflowY: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  addButton: {
    background: 'none',
    border: '1px solid #4CAF50',
    color: '#4CAF50',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  orderSummary: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '8px',
    marginTop: '8px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  addressCard: {
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  addressCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  addressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  addressType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  addressIcon: {
    fontSize: '16px',
  },
  addressTypeName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
    fontWeight: '500',
  },
  radioButton: {
    width: '16px',
    height: '16px',
    accentColor: '#4CAF50',
  },
  addressText: {
    fontSize: '14px',
    color: '#555',
    margin: '4px 0',
    lineHeight: '1.4',
  },
  addressDetails: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0',
  },
  addressPhone: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0',
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  paymentCard: {
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  paymentCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  paymentIcon: {
    fontSize: '20px',
    marginRight: '8px',
  },
  paymentLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  paymentDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
    lineHeight: '1.4',
  },
  instructionsInput: {
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical' as const,
    outline: 'none',
  },
  footer: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  deliveryInfo: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 4px 0',
  },
  totalInfo: {
    fontSize: '14px',
    color: '#333',
    margin: '0',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
};