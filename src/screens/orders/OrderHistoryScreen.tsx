import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Order, OrderStatus } from '../../../lib/types/order';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

// Mock order data
const MOCK_ORDERS: Order[] = [
  {
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
    ],
    totalAmount: 25.98,
    discount: 0,
    deliveryCharge: 5.00,
    finalAmount: 30.98,
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
  },
  {
    id: 'ORD-002',
    userId: 'user1',
    items: [
      {
        id: 'item2',
        productId: 'prod2',
        name: 'Fresh Milk',
        image: 'https://via.placeholder.com/100x100/FFFFFF/4169E1?text=Milk',
        unit: 'liter',
        price: 6.25,
        quantity: 2,
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
        totalPrice: 12.50,
      },
    ],
    totalAmount: 12.50,
    discount: 0,
    deliveryCharge: 5.00,
    finalAmount: 17.50,
    status: 'out_for_delivery',
    paymentStatus: 'completed',
    deliverySlot: {
      id: 'slot2',
      date: '2024-01-16',
      time: '10:00-12:00',
      type: 'morning',
      capacity: 10,
      bookedCount: 3,
      available: true,
      charge: 5.00,
      estimatedDelivery: '2024-01-16T12:00:00Z',
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
    estimatedDelivery: '2024-01-16T12:00:00Z',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
];

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

export const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(MOCK_ORDERS);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleOrderPress = (order: Order) => {
    Alert.alert('Order Details', `Order ID: ${order.id}\nStatus: ${getStatusText(order.status)}`);
  };

  const handleTrackOrder = (order: Order) => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      Alert.alert('Tracking', 'This order is no longer being tracked.');
    } else {
      Alert.alert('Track Order', `Tracking order: ${order.id}`);
    }
  };

  const handleReorder = (order: Order) => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity onPress={() => handleOrderPress(item)}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          <Text style={styles.itemsText}>
            {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.totalAmount}>AED {item.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.orderActions}>
          {(item.status === 'confirmed' || item.status === 'processing' || item.status === 'out_for_delivery') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => handleTrackOrder(item)}
            >
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.reorderButton]}
            onPress={() => handleReorder(item)}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderFilterButton = (filterValue: 'all' | OrderStatus, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === filterValue && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading your orders..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('out_for_delivery', 'Out for Delivery')}
        {renderFilterButton('delivered', 'Delivered')}
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No orders found</Text>
          <Text style={styles.emptyStateText}>
            {filter === 'all' 
              ? "You haven't placed any orders yet."
              : `No ${getStatusText(filter as OrderStatus).toLowerCase()} orders found.`
            }
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => Alert.alert('Navigation', 'Navigate to Home screen')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: colors.accent,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  orderCard: {
    marginBottom: 15,
    padding: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemsText: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButton: {
    backgroundColor: '#007AFF',
  },
  trackButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  reorderButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  reorderButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

// Default export to satisfy Expo Router (this file should be treated as a route)
export default OrderHistoryScreen;

