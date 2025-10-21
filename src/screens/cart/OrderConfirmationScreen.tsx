import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useOrders } from '../../hooks/useOrders';

interface OrderConfirmationProps {
  route?: {
    params?: {
      orderId?: string;
    };
  };
}

const OrderConfirmationScreen: React.FC<OrderConfirmationProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orders, loading } = useOrders();
  
  const [order, setOrder] = useState<any>(null);
  const orderId = (route.params as any)?.orderId;

  useEffect(() => {
    if (orderId) {
      // Find order by ID
      const foundOrder = orders.find((o: any) => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Create a mock order for demonstration
        setOrder({
          id: orderId,
          status: 'confirmed',
          items: [
            { id: '1', name: 'Organic Apples', quantity: 2, price: 15.99 },
            { id: '2', name: 'Fresh Bananas', quantity: 1, price: 8.50 },
          ],
          total: 24.49,
          deliveryAddress: {
            street: '123 Main Street',
            city: 'Dubai',
            state: 'Dubai',
          },
          estimatedDelivery: '2-3 hours',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [orderId, orders]);

  const handleContinueShopping = () => {
    navigation.navigate('Home' as never);
  };

  const handleTrackOrder = () => {
    // navigation.navigate('OrderTracking', { orderId });
    console.log('Track order:', orderId);
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders' as never);
  };

  if (loading || !order) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Order Confirmation" />
      
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollViewContent}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your order. We'll deliver your fresh groceries soon.
          </Text>
        </View>

        {/* Order Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>#{order.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, styles.statusText]}>
              {order.status?.toUpperCase() || 'CONFIRMED'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Delivery</Text>
            <Text style={styles.detailValue}>{order.estimatedDelivery || '2-3 hours'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Total</Text>
            <Text style={[styles.detailValue, styles.totalText]}>
              ₹{order.total?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </Card>

        {/* Delivery Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {order.deliveryAddress?.street || 'Address not available'}
            </Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
            </Text>
          </View>
        </Card>

        {/* Order Items */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price?.toFixed(2) || '0.00'}</Text>
            </View>
          )) || (
            <Text style={styles.noItemsText}>No items found</Text>
          )}
        </Card>

        {/* Next Steps */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>📦</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Preparing Your Order</Text>
              <Text style={styles.stepDescription}>
                Our team is carefully selecting and packing your items
              </Text>
            </View>
          </View>
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>🚚</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>On the Way</Text>
              <Text style={styles.stepDescription}>
                You'll receive a notification when your order is out for delivery
              </Text>
            </View>
          </View>
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>🏠</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Delivered</Text>
              <Text style={styles.stepDescription}>
                Fresh groceries delivered right to your doorstep
              </Text>
            </View>
          </View>
        </Card>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomSection}>
        <Button
          title="Track Order"
          onPress={handleTrackOrder}
          style={styles.trackButton}
          variant="outline"
        />
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollViewContent: {
    paddingBottom: 140, // Extra padding to ensure content is not hidden behind buttons
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  noItemsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  trackButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});

export default OrderConfirmationScreen;

