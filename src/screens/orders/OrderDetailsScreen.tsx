// app/screens/orders/OrderDetailsScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import priceCalculator from '../../../lib/services/business/priceCalculator';
import { Order, OrderStatus } from '../../../lib/types/order';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useTheme } from '../../hooks/useTheme';

interface OrderDetailsRouteParams {
  orderId: string;
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return '#FFA500';
    case 'confirmed':
      return '#007AFF';
    case 'processing':
      return '#8A2BE2';
    case 'out_for_delivery':
      return '#FF6B6B';
    case 'delivered':
      return '#28A745';
    case 'cancelled':
      return '#DC3545';
    default:
      return '#666';
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'processing':
      return 'Processing';
    case 'packed':
      return 'Packed';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
};

// Mock order data - in real app, this would come from API
const MOCK_ORDER: Order = {
  id: 'ORD-001',
  userId: 'user1',
  items: [
    {
      id: 'item1',
      productId: 'prod1',
      name: 'Fresh Bananas',
      image: 'https://via.placeholder.com/100x100/FFE135/000000?text=Banana',
      unit: 'kg',
      price: 12.99,
      discountedPrice: 12.99,
      quantity: 2,
      maxQuantity: 50,
      isAvailable: true,
      product: {
        id: 'prod1',
        name: 'Fresh Bananas',
        price: 12.99,
        originalPrice: 15.99,
        unit: 'kg',
        category: { id: '1', name: 'Fresh Fruits', image: '', isActive: true },
        images: ['https://via.placeholder.com/100x100/FFE135/000000?text=Banana'],
        stock: 50,
        isOrganic: false,
        tags: ['fresh', 'fruit'],
        isActive: true,
        rating: 4.5,
        reviewCount: 128,
        description: 'Fresh bananas',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      totalPrice: 25.98,
    },
    {
      id: 'item2',
      productId: 'prod2',
      name: 'Fresh Milk',
      image: 'https://via.placeholder.com/100x100/FFFFFF/4169E1?text=Milk',
      unit: 'liter',
      price: 6.25,
      quantity: 1,
      maxQuantity: 100,
      isAvailable: true,
      product: {
        id: 'prod2',
        name: 'Fresh Milk',
        price: 6.25,
        unit: 'liter',
        category: { id: '2', name: 'Dairy', image: '', isActive: true },
        images: ['https://via.placeholder.com/100x100/FFFFFF/4169E1?text=Milk'],
        stock: 100,
        isOrganic: false,
        tags: ['dairy', 'fresh'],
        isActive: true,
        rating: 4.7,
        reviewCount: 256,
        description: 'Fresh milk',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      totalPrice: 6.25,
    },
  ],
  totalAmount: 32.23,
  discount: 0,
  deliveryCharge: 5.00,
  finalAmount: 37.23,
  status: 'delivered',
  paymentStatus: 'completed',
  deliverySlot: {
    id: 'slot1',
    date: '2024-01-15',
    time: '14:00-16:00',
    type: 'evening',
    capacity: 10,
    bookedCount: 5,
    available: true,
    charge: 5.00,
    estimatedDelivery: '2024-01-15T16:00:00Z',
  },
  deliveryAddress: {
    id: 'addr1',
    street: '123 Main Street',
    city: 'Dubai',
    state: 'Dubai',
    pincode: '12345',
    area: 'Downtown',
    isDefault: true,
  },
  estimatedDelivery: '2024-01-15T16:00:00Z',
  actualDelivery: '2024-01-15T15:30:00Z',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T15:30:00Z',
};

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as OrderDetailsRouteParams;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrder(MOCK_ORDER);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      Alert.alert('Tracking', 'This order is no longer being tracked.');
    } else {
      Alert.alert('Track Order', `Tracking order: ${order?.id}`);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    
    Alert.alert(
      'Reorder',
      `Add ${order.items.length} items to cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => Alert.alert('Success', 'Items added to cart!') 
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => Alert.alert('Order Cancelled', 'Your order has been cancelled.') 
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Loading order details..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Order Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Order Details"
        rightActions={[
          {
            icon: 'share',
            onPress: () => Alert.alert('Share', 'Share order details'),
          }
        ]}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <Card style={styles.headerCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
        </Card>

        {/* Order Items */}
        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
                <Text style={styles.itemPrice}>
                  {priceCalculator.formatPrice(item.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {priceCalculator.formatPrice(item.totalPrice)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Delivery Information */}
        <Card style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.deliveryRow}>
            <Icon name="location-on" size={20} color="#666" />
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <Text style={styles.deliveryText}>
                {order.deliveryAddress.street}, {order.deliveryAddress.area}
              </Text>
              <Text style={styles.deliveryText}>
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryRow}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryLabel}>Delivery Slot</Text>
              <Text style={styles.deliveryText}>
                {order.deliverySlot.date} • {order.deliverySlot.time}
              </Text>
              {order.actualDelivery ? (
                <Text style={styles.deliveredText}>
                  Delivered on {formatDate(order.actualDelivery)}
                </Text>
              ) : (
                <Text style={styles.estimatedText}>
                  Estimated: {formatDate(order.estimatedDelivery)}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total</Text>
            <Text style={styles.summaryValue}>
              {priceCalculator.formatPrice(order.totalAmount)}
            </Text>
          </View>

          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -{priceCalculator.formatPrice(order.discount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryCharge === 0 
                ? 'FREE' 
                : priceCalculator.formatPrice(order.deliveryCharge)
              }
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {priceCalculator.formatPrice(order.finalAmount)}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {(order.status === 'confirmed' || order.status === 'processing' || order.status === 'out_for_delivery') && (
            <Button
              title="Track Order"
              onPress={handleTrackOrder}
              style={styles.trackButton}
              variant="primary"
            />
          )}
          
          <Button
            title="Reorder Items"
            onPress={handleReorder}
            style={styles.reorderButton}
            variant="outline"
          />

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  errorButton: {
    width: 200,
  },
  headerCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  itemsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  deliveryCard: {
    marginBottom: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deliveryDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deliveredText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '500',
    marginTop: 4,
  },
  estimatedText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 4,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  discountText: {
    color: '#28A745',
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
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionButtons: {
    paddingBottom: 20,
  },
  trackButton: {
    marginBottom: 12,
  },
  reorderButton: {
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#DC3545',
  },
});

export default OrderDetailsScreen;

