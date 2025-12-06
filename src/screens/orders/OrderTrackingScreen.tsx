// app/screens/orders/OrderTrackingScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import orderManagementService, { OrderWithDetails } from '../../../lib/supabase/services/orderManagement';
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
  View,
} from '../../components/ui/WebCompatibleComponents';

interface OrderTrackingRouteParams {
  orderId: string;
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending';
}

const { width } = Dimensions.get('window');

const getTrackingSteps = (order: OrderWithDetails): TrackingStep[] => {
  const steps: TrackingStep[] = [
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared.',
      status: 'completed',
      timestamp: order.created_at,
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'We are preparing your items for delivery.',
      status: order.status === 'confirmed' ? 'current' : ['preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : 'pending',
      timestamp: ['preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? order.updated_at : undefined,
    },
    {
      id: 'packed',
      title: 'Packed',
      description: 'Your order has been packed and is ready for delivery.',
      status: order.status === 'preparing' ? 'current' : ['out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : 'pending',
      timestamp: ['out_for_delivery', 'delivered'].includes(order.status) ? order.updated_at : undefined,
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      description: 'Your order is on the way to your delivery address.',
      status: order.status === 'out_for_delivery' ? 'current' : order.status === 'delivered' ? 'completed' : 'pending',
      timestamp: ['out_for_delivery', 'delivered'].includes(order.status) ? order.updated_at : undefined,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Your order has been successfully delivered.',
      status: order.status === 'delivered' ? 'completed' : 'pending',
      timestamp: order.actual_delivery_time,
    },
  ];

  return steps;
};

export const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as OrderTrackingRouteParams;

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
      console.error('Error loading order tracking:', error);
      Alert.alert('Error', 'Failed to load order tracking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStepIconName = (stepId: string): string => {
    switch (stepId) {
      case 'confirmed':
        return 'check-circle';
      case 'processing':
        return 'hourglass-empty';
      case 'packed':
        return 'inventory';
      case 'out_for_delivery':
        return 'local-shipping';
      case 'delivered':
        return 'home';
      default:
        return 'radio-button-unchecked';
    }
  };

  const getStepColor = (status: 'completed' | 'current' | 'pending'): string => {
    switch (status) {
      case 'completed':
        return '#28A745';
      case 'current':
        return '#007AFF';
      case 'pending':
        return '#E0E0E0';
      default:
        return '#E0E0E0';
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading order tracking..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Track Order" />
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

  const trackingSteps = getTrackingSteps(order);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Track Order"
        rightActions={[
          {
            icon: 'refresh',
            onPress: () => loadOrderDetails(),
          }
        ]}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <Card style={styles.orderInfoCard}>
          <Text style={styles.orderId}>Order #{order.order_number}</Text>
          <Text style={styles.estimatedDelivery}>
            Estimated delivery: {formatDate(order.estimated_delivery_time)}
          </Text>
          <Text style={styles.deliverySlot}>
            {order.delivery_slot?.slot_date} • {order.delivery_slot?.slot_type}
          </Text>
        </Card>

        {/* Delivery Address */}
        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Icon name="location-on" size={20} color="#007AFF" />
            <Text style={styles.addressTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>
            {order.delivery_address.address_line_1}
            {order.delivery_address.address_line_2 ? `, ${order.delivery_address.address_line_2}` : ''}
          </Text>
          <Text style={styles.addressText}>
            {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.pincode}
          </Text>
        </Card>

        {/* Tracking Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>

          <View style={styles.timeline}>
            {trackingSteps.map((step, index) => (
              <View key={step.id} style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View
                    style={[
                      styles.timelineIcon,
                      { backgroundColor: getStepColor(step.status) },
                    ]}
                  >
                    <Icon
                      name={getStepIconName(step.id)}
                      size={20}
                      color={step.status === 'pending' ? '#999' : '#fff'}
                    />
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            step.status === 'completed' ? '#28A745' : '#E0E0E0',
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color:
                          step.status === 'pending' ? '#999' : '#1a1a1a',
                        fontWeight: step.status === 'current' ? 'bold' : '600',
                      },
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: step.status === 'pending' ? '#ccc' : '#666' },
                    ]}
                  >
                    {step.description}
                  </Text>
                  {step.timestamp && (
                    <Text style={styles.stepTimestamp}>
                      {formatDate(step.timestamp)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="View Order Details"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('OrderDetails', { orderId: order.id });
            }}
            style={styles.detailsButton}
            variant="outline"
          />

          {order.status === 'out_for_delivery' && (
            <Button
              title="Contact Delivery Partner"
              onPress={() => Alert.alert('Contact', 'Calling delivery partner...')}
              style={styles.contactButton}
              variant="primary"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  orderInfoCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  estimatedDelivery: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  deliverySlot: {
    fontSize: 14,
    color: '#666',
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineCard: {
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  stepTimestamp: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionButtons: {
    paddingBottom: 20,
  },
  detailsButton: {
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#007AFF',
  },
});

export default OrderTrackingScreen;
