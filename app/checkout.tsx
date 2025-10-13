import React, { useState } from 'react';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';
import { useCart } from '../src/hooks/useCart';

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

const mockAddresses: DeliveryAddress[] = [
  {
    id: '1',
    type: 'home',
    name: 'Home',
    address: '123 Green Valley Apartments, MG Road',
    city: 'Hosur',
    state: 'Tamil Nadu',
    pincode: '635109',
    phone: '+91 9876543210',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    name: 'Office',
    address: '456 Tech Park, Electronic City',
    city: 'Hosur',
    state: 'Tamil Nadu',
    pincode: '635110',
    phone: '+91 9876543210',
    isDefault: false,
  }
];

export default function CheckoutScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { items, subtotal, deliveryCharge, discount, vatAmount, total, itemCount } = useCart();
  
  const [selectedAddress, setSelectedAddress] = useState<string>(mockAddresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleAddAddress = () => {
    // This would normally open an address form modal or navigate to address screen
    alert('Add address functionality to be implemented');
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock order placement
      const orderData = {
        items,
        selectedAddress: mockAddresses.find(addr => addr.id === selectedAddress),
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
      
      // Navigate to order confirmation
      router.replace('/order-confirmation');
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAddressData = mockAddresses.find(addr => addr.id === selectedAddress);

  return (
    <div style={styles.container}>
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
            {mockAddresses.map((address) => (
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
            ))}
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
              ...(isLoading ? styles.placeOrderButtonDisabled : {})
            }}
            onClick={handlePlaceOrder}
            disabled={isLoading}
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
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
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