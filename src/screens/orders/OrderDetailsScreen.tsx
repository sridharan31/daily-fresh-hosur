// app/screens/orders/OrderDetailsScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import Icon from 'react-native-vector-icons/MaterialIcons';
import priceCalculator from '../../../lib/services/business/priceCalculator';
import orderManagementService, { OrderStatus, OrderWithDetails } from '../../../lib/supabase/services/orderManagement';
import { AppDispatch } from '../../../lib/supabase/store';
import { addToCart } from '../../../lib/supabase/store/actions/cartActions';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import LoadingScreen from '../../components/common/LoadingScreen';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from '../../components/ui/WebCompatibleComponents';
import { useAuth } from '../../hooks/useAuth';
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
    case 'preparing':
      return '#8A2BE2';
    case 'out_for_delivery':
      return '#FF6B6B';
    case 'delivered':
      return '#28A745';
    case 'cancelled':
      return '#DC3545';
    case 'refunded':
      return '#666';
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
    case 'preparing':
      return 'Preparing';
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

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as OrderDetailsRouteParams;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderDetails = await orderManagementService.getOrderDetails(orderId);
      setOrder(orderDetails);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (order?.status === 'delivered' || order?.status === 'cancelled' || order?.status === 'refunded') {
      Alert.alert('Tracking', 'This order is no longer being tracked.');
    } else {
      // @ts-ignore
      navigation.navigate('OrderTracking', { orderId: order?.id });
    }
  };

  const handleReorder = async () => {
    if (!order || !user?.id) return;

    Alert.alert(
      'Reorder',
      `Add ${order.items.length} items to cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: async () => {
            try {
              // Add all items to cart
              const promises = order.items.map(item =>
                dispatch(addToCart({
                  userId: user.id,
                  productId: item.product_id,
                  quantity: item.quantity
                })).unwrap()
              );

              await Promise.all(promises);

              Alert.alert(
                'Success',
                'Items added to cart!',
                [
                  {
                    text: 'Go to Cart',
                    onPress: () => navigation.navigate('CartTab' as never)
                  },
                  {
                    text: 'Continue Shopping',
                    style: 'cancel'
                  }
                ]
              );
            } catch (error) {
              console.error('Error reordering:', error);
              Alert.alert('Error', 'Failed to add items to cart. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    if (order?.status === 'delivered' || order?.status === 'cancelled' || order?.status === 'refunded') {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled.');
      return;
    }

    if (!['pending', 'confirmed'].includes(order?.status || '')) {
      Alert.alert('Cannot Cancel', 'Order is already being processed and cannot be cancelled.');
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
          onPress: async () => {
            try {
              if (order?.id && order?.user_id) {
                await orderManagementService.cancelOrder(order.id, order.user_id, 'Cancelled by user');
                Alert.alert('Order Cancelled', 'Your order has been cancelled.');
                loadOrderDetails(); // Refresh details
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
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
              <Text style={styles.orderId}>Order #{order.order_number}</Text>
              <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
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
              <Image source={{ uri: item.product_image || 'https://via.placeholder.com/50' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                {/* Unit is not available in OrderItem, skipping */}
                <Text style={styles.itemPrice}>
                  {priceCalculator.formatPrice(item.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {priceCalculator.formatPrice(item.total)}
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
                {order.delivery_address.address_line_1 || order.delivery_address.address_line1}
                {order.delivery_address.address_line_2 ? `, ${order.delivery_address.address_line_2}` : ''}
              </Text>
              <Text style={styles.deliveryText}>
                {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.pincode || order.delivery_address.postal_code}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryRow}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryLabel}>Delivery Slot</Text>
              <Text style={styles.deliveryText}>
                {order.delivery_slot?.slot_date} • {order.delivery_slot?.slot_type}
              </Text>
              {order.actual_delivery_time ? (
                <Text style={styles.deliveredText}>
                  Delivered on {formatDate(order.actual_delivery_time)}
                </Text>
              ) : (
                <Text style={styles.estimatedText}>
                  Estimated: {formatDate(order.estimated_delivery_time)}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {priceCalculator.formatPrice(order.subtotal)}
            </Text>
          </View>

          {order.discount_amount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -{priceCalculator.formatPrice(order.discount_amount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>
              {order.delivery_charge === 0
                ? 'FREE'
                : priceCalculator.formatPrice(order.delivery_charge)
              }
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (GST)</Text>
            <Text style={styles.summaryValue}>
              {priceCalculator.formatPrice(order.gst_amount)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {priceCalculator.formatPrice(order.total_amount)}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
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

          {['pending', 'confirmed'].includes(order.status) && (
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
