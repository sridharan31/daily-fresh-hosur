import { router, useLocalSearchParams } from 'expo-router';
import type { CSSProperties } from 'react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { orderService } from '../lib/supabase/services/order';
import { RootState } from '../lib/supabase/store/rootReducer';
import { formatHelpers } from '../lib/utils/helpers';

// Use conditional imports for platform compatibility
let View: any, Text: any, TouchableOpacity: any, StyleSheet: any, ScrollView: any;

// Import React Native components only in React Native environment
if (typeof window === 'undefined' || !('document' in window)) {
  // React Native environment
  const ReactNative = require('react-native');
  View = ReactNative.View;
  Text = ReactNative.Text;
  TouchableOpacity = ReactNative.TouchableOpacity;
  StyleSheet = ReactNative.StyleSheet;
  ScrollView = ReactNative.ScrollView;
} else {
  // Web environment - create stub components to keep TypeScript happy
  View = 'div';
  Text = 'span';
  TouchableOpacity = 'button';
  StyleSheet = {
    create: (styles: any) => styles
  };
  ScrollView = 'div';
}

// Web-compatible CSS
if (typeof window !== 'undefined') {
  require('../global.css');
}

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedTime] = useState('30-45 minutes');
  
  // Normalize order data to handle different formats
  const normalizeOrderData = (data: any) => {
    if (!data) return null;
    
    // Normalize items to ensure consistent format
    if (data.items) {
      data.items = data.items.map((item: any) => ({
        ...item,
        // Ensure product info is available in a consistent format
        product_name: item.product_name || 
                     item.product?.name_en || 
                     item.product?.name || 
                     'Product',
        unit_price: item.unit_price || item.price || 0,
        // Make sure we have quantity
        quantity: item.quantity || 1
      }));
    }
    
    // Normalize price fields
    return {
      ...data,
      subtotal: data.subtotal || data.pricing?.subtotal || 
                (data.total_amount ? data.total_amount * 0.85 : 0),
      shipping_fee: data.shipping_fee || data.pricing?.deliveryCharge || data.delivery_charge || 0,
      discount: data.discount || data.pricing?.discount || 0,
      tax: data.tax || data.gst_amount || data.pricing?.vatAmount || 
            (data.total_amount ? data.total_amount * 0.15 : 0),
      total: data.total || data.pricing?.total || data.total_amount || 0,
    };
  };

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const redirectTimer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 10000);
    
    // Clean up timer
    return () => clearTimeout(redirectTimer);
  }, []);
  
  useEffect(() => {
    async function loadOrderDetails() {
      try {
        let orderIdToUse = orderId as string;
        
        if (!orderIdToUse) {
          // Try to get from localStorage
          if (typeof window !== 'undefined') {
            orderIdToUse = localStorage.getItem('last_order_id') || '';
          }
        }
        
        setOrderNumber(orderIdToUse ? orderIdToUse.slice(-6) : `GRO${Date.now().toString().slice(-6)}`);
        
        if (orderIdToUse) {
          if (orderIdToUse.startsWith('guest-')) {
            // Load guest order from localStorage
            if (typeof window !== 'undefined') {
              const guestOrderData = localStorage.getItem(`guest_order_${orderIdToUse}`);
              if (guestOrderData) {
                const parsedData = JSON.parse(guestOrderData);
                setOrderDetails(normalizeOrderData(parsedData));
              }
            }
          } else if (user) {
            // Load from Supabase for authenticated users
            try {
              const orderData = await orderService.getOrderDetails(orderIdToUse);
              console.log('Order data received:', JSON.stringify(orderData, null, 2));
              // Normalize the order data before setting it
              const normalizedData = normalizeOrderData(orderData);
              console.log('Normalized order data:', JSON.stringify(normalizedData, null, 2));
              setOrderDetails(normalizedData);
            } catch (err) {
              console.error('Error fetching order details:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error processing order details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadOrderDetails();
  }, [orderId, user]);

  const handleContinueShopping = () => {
    router.replace('/(tabs)/home');
  };

  const handleTrackOrder = () => {
    router.push('/(tabs)/orders');
  };

  // For web rendering
  if (typeof window !== 'undefined') {
    return (
      <div style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
        position: 'relative',
      }}>
        <div style={webStyles.container}>
        {/* Success Animation */}
        <div style={webStyles.successSection}>
          <div style={webStyles.checkmarkContainer}>
            <div style={webStyles.checkmark}>✓</div>
          </div>
          <h1 style={webStyles.successTitle}>Order Placed Successfully!</h1>
          <p style={webStyles.successMessage}>
            Thank you for your order. We're preparing your fresh groceries!
          </p>
        </div>

        {/* Order Details */}
        <div style={webStyles.orderDetails}>
          <div style={webStyles.orderCard}>
            <h2 style={webStyles.orderTitle}>Order Details</h2>
            <div style={webStyles.orderInfo}>
              <div style={webStyles.infoRow}>
                <span style={webStyles.infoLabel}>Order Number:</span>
                <span style={webStyles.infoValue}>#{orderNumber}</span>
              </div>
              
              {loading ? (
                <div style={webStyles.loadingText}>Loading order details...</div>
              ) : orderDetails ? (
                <>
                  {orderDetails.items && orderDetails.items.length > 0 && (
                    <div style={webStyles.itemsContainer}>
                      <h3 style={webStyles.itemsTitle}>Items</h3>
                      {orderDetails.items.map((item: any, index: number) => (
                        <div key={index} style={webStyles.itemRow}>
                          <span style={webStyles.itemQuantity}>{item.quantity}x</span>
                          <span style={webStyles.itemName}>
                            {item.product_name}
                          </span>
                          <span style={webStyles.itemPrice}>
                            {formatHelpers.formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    
                      <div style={webStyles.totalsSection}>
                        <div style={webStyles.totalRow}>
                          <span>Subtotal:</span>
                          <span>{formatHelpers.formatPrice(orderDetails.subtotal || 0)}</span>
                        </div>
                        <div style={webStyles.totalRow}>
                          <span>Delivery:</span>
                          <span>{formatHelpers.formatPrice(orderDetails.shipping_fee || 0)}</span>
                        </div>
                        {orderDetails.discount > 0 && (
                          <div style={webStyles.totalRow}>
                            <span>Discount:</span>
                            <span>-{formatHelpers.formatPrice(orderDetails.discount || 0)}</span>
                          </div>
                        )}
                        <div style={webStyles.totalRow}>
                          <span>Tax:</span>
                          <span>{formatHelpers.formatPrice(orderDetails.tax || 0)}</span>
                        </div>
                        <div style={{...webStyles.totalRow, ...webStyles.grandTotal}}>
                          <span>Total:</span>
                          <span>{formatHelpers.formatPrice(orderDetails.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={webStyles.infoRow}>
                    <span style={webStyles.infoLabel}>Estimated Delivery:</span>
                    <span style={webStyles.infoValue}>{estimatedTime}</span>
                  </div>
                  <div style={webStyles.infoRow}>
                    <span style={webStyles.infoLabel}>Status:</span>
                    <span style={webStyles.statusValue}>Order Confirmed</span>
                  </div>
                  
                  {/* Display shipping address if available */}
                  {orderDetails?.shipping_address && (
                    <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                      <div style={{marginBottom: '8px'}}>
                        <span style={{fontSize: '14px', fontWeight: 'bold', color: '#333'}}>Delivery Address:</span>
                      </div>
                      <div style={{fontSize: '14px', color: '#666', lineHeight: '1.4'}}>
                        <div>{orderDetails.shipping_address.name}</div>
                        <div>{orderDetails.shipping_address.address_line1}</div>
                        {orderDetails.shipping_address.address_line2 && <div>{orderDetails.shipping_address.address_line2}</div>}
                        <div>{orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}</div>
                        {orderDetails.shipping_address.phone && <span>Phone: {orderDetails.shipping_address.phone}</span>}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
          
          {/* Timeline */}
          <div style={webStyles.timelineCard}>
            <h3 style={webStyles.timelineTitle}>Order Timeline</h3>
            <div style={webStyles.timeline}>
              <div style={webStyles.timelineItem}>
                <div style={webStyles.timelineIcon}>✓</div>
                <div style={webStyles.timelineContent}>
                  <p style={webStyles.timelineText}>Order Placed</p>
                  <p style={webStyles.timelineTime}>Just now</p>
                </div>
              </div>
              <div style={webStyles.timelineItem}>
                <div style={{...webStyles.timelineIcon, ...webStyles.timelineIconPending}}>⏳</div>
                <div style={webStyles.timelineContent}>
                  <p style={webStyles.timelineText}>Preparing Order</p>
                  <p style={webStyles.timelineTime}>5-10 minutes</p>
                </div>
              </div>
              <div style={webStyles.timelineItem}>
                <div style={{...webStyles.timelineIcon, ...webStyles.timelineIconPending}}>🚚</div>
                <div style={webStyles.timelineContent}>
                  <p style={webStyles.timelineText}>Out for Delivery</p>
                  <p style={webStyles.timelineTime}>25-35 minutes</p>
                </div>
              </div>
              <div style={webStyles.timelineItem}>
                <div style={{...webStyles.timelineIcon, ...webStyles.timelineIconPending}}>📦</div>
                <div style={webStyles.timelineContent}>
                  <p style={webStyles.timelineText}>Delivered</p>
                  <p style={webStyles.timelineTime}>30-45 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div style={webStyles.nextSteps}>
            <h3 style={webStyles.nextStepsTitle}>What's Next?</h3>
            <div style={webStyles.stepsList}>
              <div style={webStyles.step}>
                <span style={webStyles.stepIcon}>📱</span>
                <span style={webStyles.stepText}>You'll receive SMS updates on your order status</span>
              </div>
              <div style={webStyles.step}>
                <span style={webStyles.stepIcon}>🔔</span>
                <span style={webStyles.stepText}>Push notifications will keep you informed</span>
              </div>
              <div style={webStyles.step}>
                <span style={webStyles.stepIcon}>📞</span>
                <span style={webStyles.stepText}>Our delivery partner will call before arriving</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={webStyles.actions}>
          <button style={webStyles.trackButton} onClick={handleTrackOrder}>
            Track Order
          </button>
          <button style={webStyles.continueButton} onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>

        {/* Auto-redirect notice */}
        <div style={webStyles.autoRedirect}>
          <p style={webStyles.autoRedirectText}>
            You'll be redirected to home in 10 seconds...
          </p>
        </div>
      </div>
      </div>
    );
  }
  
  // For native rendering (fallback)
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>Order #{orderNumber}</Text>
        </View>
        
        {loading ? (
          <Text>Loading order details...</Text>
        ) : (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {orderDetails?.items?.map((item: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <Text>{item.quantity}x {item.product_name}</Text>
                <Text>{formatHelpers.formatPrice((item.unit_price) * item.quantity)}</Text>
              </View>
            ))}
            
            {/* Price breakdown */}
            <View style={styles.totalsSection}>
              <View style={styles.priceRow}>
                <Text>Subtotal:</Text>
                <Text>{formatHelpers.formatPrice(orderDetails?.subtotal || 0)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text>Delivery:</Text>
                <Text>{formatHelpers.formatPrice(orderDetails?.shipping_fee || 0)}</Text>
              </View>
              {orderDetails?.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text>Discount:</Text>
                  <Text>-{formatHelpers.formatPrice(orderDetails.discount)}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text>Tax:</Text>
                <Text>{formatHelpers.formatPrice(orderDetails?.tax || 0)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {formatHelpers.formatPrice(orderDetails?.total || 0)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.deliveryInfo}>
              Estimated delivery: {estimatedTime}
            </Text>
            
            {/* Display shipping address if available */}
            {orderDetails?.shipping_address && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressTitle}>Delivery Address:</Text>
                <Text style={styles.addressText}>{orderDetails.shipping_address.name}</Text>
                <Text style={styles.addressText}>{orderDetails.shipping_address.address_line1}</Text>
                {orderDetails.shipping_address.address_line2 && 
                  <Text style={styles.addressText}>{orderDetails.shipping_address.address_line2}</Text>
                }
                <Text style={styles.addressText}>
                  {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}
                </Text>
                {orderDetails.shipping_address.phone && 
                  <Text style={styles.addressText}>Phone: {orderDetails.shipping_address.phone}</Text>
                }
              </View>
            )}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleTrackOrder}>
            <Text style={styles.buttonText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleContinueShopping}>
            <Text style={styles.buttonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Styles for React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deliveryInfo: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  addressContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// Web styles as JavaScript object with proper typing
const webStyles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100%',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    alignItems: 'center',
    paddingBottom: '120px', /* Extra space for the fixed buttons */
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  successSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  checkmarkContainer: {
    marginBottom: '24px',
  },
  checkmark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 12px 0',
  },
  successMessage: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  orderDetails: {
    width: '100%',
    maxWidth: '500px',
    marginBottom: '32px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  orderTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#666',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4CAF50',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  timelineTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timelineIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '16px',
    flexShrink: 0,
  },
  timelineIconPending: {
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
  loadingText: {
    padding: '20px',
    color: '#666',
    textAlign: 'center',
    fontSize: '14px',
  },
  itemsContainer: {
    marginTop: '20px',
    borderTop: '1px solid #eee',
    paddingTop: '15px',
  },
  itemsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    marginBottom: '8px',
    borderBottom: '1px solid #f5f5f5',
  },
  itemQuantity: {
    fontSize: '14px',
    color: '#666',
    width: '30px',
  },
  itemName: {
    flex: '1',
    fontSize: '14px',
    color: '#333',
    padding: '0 10px',
  },
  itemPrice: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  totalsSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#666',
  },
  grandTotal: {
    fontWeight: 'bold',
    color: '#333',
    borderTop: '1px solid #eee',
    paddingTop: '8px',
    marginTop: '8px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: '12px',
    color: '#666',
    margin: '0',
  },
  nextSteps: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  nextStepsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    position: 'fixed',
    bottom: '20px',
    left: '0',
    padding: '0 20px',
    zIndex: '10',
    margin: '0 auto',
    right: '0',
    maxWidth: '500px',
    marginBottom: '20px',
  },
  trackButton: {
    flex: 1,
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
  continueButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#4CAF50',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  autoRedirect: {
    textAlign: 'center',
  },
  autoRedirectText: {
    fontSize: '12px',
    color: '#999',
    margin: '0',
    fontStyle: 'italic',
  },
};