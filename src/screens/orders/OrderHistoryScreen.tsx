import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import orderManagementService, { OrderStatus, OrderWithDetails } from '../../../lib/supabase/services/orderManagement';
import { AppDispatch } from '../../../lib/supabase/store';
import { addToCart } from '../../../lib/supabase/store/actions/cartActions';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';
import ReorderModal from '../../components/orders/ReorderModal';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../../components/ui/WebCompatibleComponents';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

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

export const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch<AppDispatch>();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [selectedOrderForReorder, setSelectedOrderForReorder] = useState<OrderWithDetails | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userOrders = await orderManagementService.getCustomerOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
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

  const handleOrderPress = (order: OrderWithDetails) => {
    // @ts-ignore - Navigation types need to be updated
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const handleTrackOrder = (order: OrderWithDetails) => {
    if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded') {
      Alert.alert('Tracking', 'This order is no longer being tracked.');
    } else {
      // @ts-ignore - Navigation types need to be updated
      navigation.navigate('OrderTracking', { orderId: order.id });
    }
  };

  const handleReorder = (order: OrderWithDetails) => {
    setSelectedOrderForReorder(order);
    setReorderModalVisible(true);
  };

  const confirmReorder = async () => {
    if (!selectedOrderForReorder || !user?.id) return;

    try {
      setReorderModalVisible(false);

      const promises = selectedOrderForReorder.items.map(item =>
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
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity onPress={() => handleOrderPress(item)}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
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
            {item.items?.length || 0} {(item.items?.length || 0) === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.totalAmount}>₹{item.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.orderActions}>
          {['confirmed', 'preparing', 'out_for_delivery'].includes(item.status) && (
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
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item: OrderWithDetails) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <ReorderModal
        visible={reorderModalVisible}
        orderNumber={selectedOrderForReorder?.order_number}
        itemCount={selectedOrderForReorder?.items.length || 0}
        onClose={() => setReorderModalVisible(false)}
        onConfirm={confirmReorder}
      />
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

export default OrderHistoryScreen;
