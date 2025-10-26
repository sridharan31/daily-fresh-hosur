import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';
import { orderService } from '../lib/supabase/services/order';
import { userService } from '../lib/supabase/services/user';
import { AppDispatch } from '../lib/supabase/store';
import { loginUser } from '../lib/supabase/store/actions/authActions';
import { clearCart, fetchCart } from '../lib/supabase/store/actions/cartActions';
import { RootState } from '../lib/supabase/store/rootReducer';
import { fromSupabaseAddress } from '../lib/utils/addressUtils';
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

// Guest Checkout Form Component
interface GuestCheckoutFormProps {
  onSubmit: (guestData: GuestCheckoutData) => void;
  isLoading: boolean;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ width: '100%', marginBottom: 20 }}>
      <h3 style={{ fontSize: 18, marginBottom: 15 }}>Guest Checkout</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Name *</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Email *</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Phone *</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Address *</label>
          <textarea 
            value={formData.address} 
            onChange={(e) => handleChange('address', e.target.value)}
            required
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>City *</label>
            <input 
              type="text" 
              value={formData.city} 
              onChange={(e) => handleChange('city', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: 4
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>State *</label>
            <input 
              type="text" 
              value={formData.state} 
              onChange={(e) => handleChange('state', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: 4
              }}
            />
          </div>
          <div style={{ flex: 0.7 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>Pincode *</label>
            <input 
              type="text" 
              value={formData.pincode} 
              onChange={(e) => handleChange('pincode', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: 4
              }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutScreen() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  console.log('Auth state:', { isAuthenticated, user });
  
  // Check Supabase session directly to ensure we're authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Direct Supabase session check:", session);
      
      if (session?.user && (!isAuthenticated || !user)) {
        console.log("Session exists but Redux store doesn't have user. Restoring...");
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
  const { items: rawItems, subtotal, deliveryCharge, discount, vatAmount, total, itemCount } = useCart();
  
  // Process cart items to ensure they have all required properties
  const items = React.useMemo(() => {
    return (rawItems || []).map(item => {
      // Extract product information from the item.product object if available
      const product = item.product || {};
      
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
        discountedPrice: discountedPrice < itemPrice ? discountedPrice : undefined,
        totalPrice,
        image: imageUrl,
        unit: item.unit || product.unit || 'each'
      };
    });
  }, [rawItems]);
  
  // Cart state from Redux store is synchronized with Supabase cart_items table
  
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

  const handleBack = () => {
    router.back();
  };

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  
  // Create a function to load addresses that can be reused
  const loadAddresses = async () => {
    if (!user?.id) {
      console.log('Cannot load addresses - no user ID available');
      return;
    }
    
    console.log('Loading addresses for user:', {
      id: user.id,
      type: typeof user.id,
      isUuid: user.id.includes('-'),
      fullUser: user
    });
    setIsAddressLoading(true);
    
    try {
      // Ensure we're using a proper UUID format
      if (!user.id.includes('-')) {
        console.error('WARNING: User ID is not in UUID format! This will likely cause errors.');
      }
      
      const addresses = await userService.getUserAddresses(user.id);
      console.log('Addresses fetched from Supabase:', addresses);
      
      // Map the Supabase address format to our DeliveryAddress format
      const mappedAddresses: DeliveryAddress[] = addresses.map((addr) => {
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
      
      console.log('Mapped addresses for UI:', mappedAddresses);
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
  };
  
  // Load addresses from Supabase when component mounts
  useEffect(() => {
    console.log('User state changed:', user);
    if (user?.id) {
      console.log('User has ID, loading addresses...');
      loadAddresses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, user?.id]);

  // Load delivery slots when delivery date changes
  useEffect(() => {
    if (deliveryDate) {
      loadDeliverySlots();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryDate]);

  // Load delivery slots based on selected date
  const loadDeliverySlots = async () => {
    if (!deliveryDate) return;

    try {
      setSlotLoading(true);
      const selectedDate = new Date(deliveryDate);
      const dayOfWeek = selectedDate.getDay();
      const slotType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';

      const { data, error } = await supabase
        .from('delivery_slot_instances')
        .select('*')
        .eq('slot_date', deliveryDate)
        .eq('slot_type', slotType)
        .eq('status', 'available')
        .order('start_ts');

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading delivery slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  const handleAddAddress = () => {
    // Open the address form modal
    setAddressModalVisible(true);
  };

  const handleSaveAddress = async (address: Address) => {
    try {
      setIsLoading(true);
      console.log('Saving address:', address);
      
      // Save to Supabase - our updated userService now handles the conversion internally
      const savedAddress = await userService.addAddress(address);
      
      console.log('Address saved successfully:', savedAddress);
      
      if (!savedAddress) {
        throw new Error('Failed to save address');
      }
      
      // Reload addresses from Supabase to ensure we have the most up-to-date data
      console.log('Reloading addresses after save...');
      await loadAddresses();
      
      // Select the newly added address
      setSelectedAddress(savedAddress.id);
      console.log('Selected address set to:', savedAddress.id);
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
        dispatch(clearCart(isAuthenticated && user ? user.id : 'guest'));
        alert('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle guest checkout submission
  const handleGuestCheckoutSubmit = (data: GuestCheckoutData) => {
    setGuestData(data);
    setIsGuestCheckout(false);
    setShowGuestLoginOption(true);
  };

  // Handle user login during checkout
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Please enter both email and password');
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
      alert('Login failed. Please check your credentials and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Skip login and continue as guest
  const handleContinueAsGuest = () => {
    setShowGuestLoginOption(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && isAuthenticated) {
      alert('Please select a delivery address');
      return;
    }
    
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setIsLoading(true);
    try {
      // Set up order data for Supabase
      let orderId;
      
      if (isAuthenticated && user) {
        // For authenticated users, create order in Supabase
        console.log('Creating order for authenticated user:', user.id);
        
        // Convert cart items to order items format
        const orderItems = items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }));
        
        // Get the selected address
        const addressData = savedAddresses.find(addr => addr.id === selectedAddress);
        
        if (!addressData) {
          throw new Error('Selected address not found');
        }
        
        // Calculate the total amount
        const totalAmount = total;
        
        // Use Supabase order service to create the order
        orderId = await orderService.createOrder(
          user.id,
          selectedAddress, // shipping address ID
          paymentMethod as any, // cast to expected type
          orderItems,
          totalAmount,
          undefined, // delivery date - could be added in the future
          undefined  // time slot - could be added in the future
        );
        
        console.log('Order created with ID:', orderId);
      } else {
        // For guest users, we'll use local storage or session storage
        // In a real implementation, you might want to create a temporary user or store guest orders
        console.log('Creating guest order');
        
        // Generate a pseudo-random ID for guest orders
        orderId = 'guest-' + Date.now().toString();
        
        // Store the order in localStorage
        const guestOrder = {
          id: orderId,
          items,
          guestAddress: guestData,
          paymentMethod,
          specialInstructions,
          pricing: {
            subtotal,
            deliveryCharge,
            discount,
            vatAmount,
            total
          },
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Store in local storage for persistence
        localStorage.setItem(`guest_order_${orderId}`, JSON.stringify(guestOrder));
        console.log('Guest order saved:', guestOrder);
      }
      
      // Clear the cart after successful order placement
      dispatch(clearCart(isAuthenticated && user ? user.id : 'guest'));
      
      // Store orderId for confirmation page
      localStorage.setItem('last_order_id', orderId);
      
      // Navigate to order confirmation
      router.replace({
        pathname: '/order-confirmation',
        params: { orderId: localStorage.getItem('last_order_id') || '' }
      });
    } catch (error) {
      console.error('Order placement failed:', error);
      
      // Better error handling with specific messages
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Address information is missing. Please select a valid address.';
        }
      }
      
      // Show error as modal or alert
      setOrderError(errorMessage);
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
        onClose={() => !isLoading && setAddressModalVisible(false)}
        onSave={handleSaveAddress}
        isSubmitting={isLoading}
      />

      {/* Guest Login Option Modal */}
      {showGuestLoginOption && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 20,
            width: '90%',
            maxWidth: 400
          }}>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Create an Account</h3>
            <p style={{ marginBottom: 15 }}>Would you like to create an account for easier checkout next time?</p>
            
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Email</label>
              <input 
                type="email" 
                value={loginEmail || (guestData?.email || '')}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                onClick={handleLogin}
                disabled={loginLoading}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  opacity: loginLoading ? 0.7 : 1
                }}
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <button 
                onClick={handleContinueAsGuest}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#f1f1f1',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBack}>
          <span style={styles.backIcon}>←</span>
        </button>
        <h1 style={styles.headerTitle}>Checkout</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Error message display */}
        {orderError && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            marginBottom: '20px',
            borderLeft: '4px solid #f44336'
          }}>
            <p style={{ color: '#c62828', margin: 0 }}>{orderError}</p>
            <button 
              onClick={() => setOrderError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#757575',
                cursor: 'pointer',
                marginTop: '8px',
                padding: 0,
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        
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
                        <div style={{backgroundColor: '#f0f0f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {item.name ? item.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      )}
                    </div>
                    <div style={styles.cartItemDetails}>
                      <h4 style={styles.cartItemName}>{item.name || (item.product && (item.product.name_en || item.product.name)) || 'Product'}</h4>
                      <p style={styles.cartItemPrice}>
                        ₹{(item.price || 0).toFixed(2)} × {item.quantity} {item.unit || 'each'}
                        {item.discountedPrice && <span style={{textDecoration: 'line-through', marginLeft: '5px', color: '#999'}}>₹{(item.price).toFixed(2)}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={styles.cartItemTotal}>₹{(item.totalPrice || (item.price || 0) * item.quantity).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
          
          <div style={styles.orderSummary}>
            <div style={styles.summaryRow}>
              <span>Items ({itemCount})</span>
              <span>₹{(subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span>₹{(deliveryCharge || 0).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={styles.summaryRow}>
                <span>Discount</span>
                <span style={styles.discountText}>-₹{(discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Taxes & Fees</span>
              <span>₹{(vatAmount || 0).toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalAmount}>₹{(total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Delivery Address</h2>
            <div>
              <button style={{...styles.addButton, marginRight: '10px'}} onClick={loadAddresses}>
                ↻ Refresh
              </button>
              <button style={styles.addButton} onClick={handleAddAddress}>
                + Add New
              </button>
            </div>
          </div>
          <div style={styles.addressList}>
            {isAddressLoading ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>Loading addresses...</p>
              </div>
            ) : savedAddresses.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center'}}>
                <p>No saved addresses found. Add your first address.</p>
                {user && (
                  <div>
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>User ID Type:</strong> {typeof user.id === 'string' ? 'string' : typeof user.id}</p>
                    <p><strong>User ID Format:</strong> {user.id.includes('-') ? 'UUID format' : 'Not UUID format'}</p>
                    <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                  </div>
                )}
                <button onClick={loadAddresses} style={{padding: '8px 16px', margin: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px'}}>
                  Try Again
                </button>
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

        {/* Delivery Slot Selection */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Select Delivery Slot</h2>
          
          {/* Date Picker */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Select Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 16
              }}
            />
          </div>

          {/* Available Slots */}
          {deliveryDate && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Choose a Time Slot
              </label>
              {slotLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#fff3cd',
                  borderRadius: 6,
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ margin: 0, color: '#856404' }}>
                    No slots available for this date. Please select another date.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {availableSlots.map((slot) => {
                    const startTime = new Date(slot.start_ts).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    const endTime = new Date(slot.end_ts).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    const isFull = slot.booked_count >= slot.capacity;
                    
                    return (
                      <div
                        key={slot.id}
                        onClick={() => !isFull && setSelectedSlot(slot.id)}
                        style={{
                          flex: '1 1 150px',
                          minWidth: '150px',
                          padding: '15px',
                          border: selectedSlot === slot.id ? '2px solid #4CAF50' : '2px solid #ddd',
                          borderRadius: 8,
                          backgroundColor: selectedSlot === slot.id ? '#f0f8f0' : '#fff',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          opacity: isFull ? 0.5 : 1,
                          textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: selectedSlot === slot.id ? '#4CAF50' : '#333',
                          marginBottom: 5
                        }}>
                          {startTime} - {endTime}
                        </div>
                        {isFull ? (
                          <div style={{ fontSize: '12px', color: '#f44336' }}>Full</div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {slot.capacity - slot.booked_count} available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
              Total: <span style={styles.totalPrice}>₹{(total || 0).toFixed(2)}</span>
            </p>
          </div>
          <button
            style={{
              ...styles.placeOrderButton,
              ...((isLoading || (!selectedAddress && isAuthenticated) || items.length === 0) ? styles.placeOrderButtonDisabled : {})
            }}
            onClick={handlePlaceOrder}
            disabled={isLoading || (!selectedAddress && isAuthenticated) || items.length === 0}
            title={
              (!selectedAddress && isAuthenticated)
                ? 'Please select a delivery address' 
                : items.length === 0 
                ? 'Your cart is empty' 
                : ''
            }
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '3px solid rgba(255,255,255,0.3)', 
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  marginRight: '8px',
                  animation: 'spin 1s linear infinite'
                }} />
                Processing Order...
              </div>
            ) : 'Place Order'}
          </button>
          
          {/* Additional hint text for button state */}
          {(!selectedAddress && isAuthenticated) && (
            <p style={{ color: '#f44336', fontSize: '14px', marginTop: '8px' }}>Please select a delivery address</p>
          )}
          {(items.length === 0) && (
            <p style={{ color: '#f44336', fontSize: '14px', marginTop: '8px' }}>Your cart is empty</p>
          )}
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