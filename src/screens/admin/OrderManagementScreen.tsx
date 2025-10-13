 // src/screens/admin/OrderManagementScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import {
    fetchAdminOrders,
    updateOrderStatus
} from '../../../lib/store/slices/adminSlice';
import { AdminOrder } from '../../../lib/types/admin';
import { OrderStatus } from '../../../lib/types/order';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

const OrderManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {orders, ordersLoading} = useSelector((state: RootState) => state.admin);
  
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    {key: 'all', label: 'All Orders', color: '#666'},
    {key: 'pending', label: 'Pending', color: '#FF9800'},
    {key: 'confirmed', label: 'Confirmed', color: '#2196F3'},
    {key: 'processing', label: 'Processing', color: '#9C27B0'},
    {key: 'out_for_delivery', label: 'Out for Delivery', color: '#FF5722'},
    {key: 'delivered', label: 'Delivered', color: '#4CAF50'},
    {key: 'cancelled', label: 'Cancelled', color: '#F44336'},
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = useCallback(() => {
    dispatch(fetchAdminOrders({}));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const filteredOrders = orders.filter((order: AdminOrder) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption?.color || '#666';
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    Alert.alert(
      'Update Order Status',
      `Change status to ${newStatus}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Update',
          onPress: () => dispatch(updateOrderStatus({orderId, status: newStatus as OrderStatus})),
        },
      ]
    );
  };

  const handleOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const renderStatusBadge = (status: string) => (
    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(status)}]}>
      <Text style={styles.statusText}>{status.replace('_', ' ').toUpperCase()}</Text>
    </View>
  );

  const renderOrderItem = ({item}: {item: AdminOrder}) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        {renderStatusBadge(item.status)}
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
      </View>
      
      <View style={styles.deliveryInfo}>
        <Icon name="schedule" size={16} color="#666" />
        <Text style={styles.deliverySlot}>
          {item.deliverySlot.date} • {item.deliverySlot.time}
        </Text>
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate(item.id, 'confirmed')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate(item.id, 'processing')}
          >
            <Text style={styles.actionButtonText}>Process</Text>
          </TouchableOpacity>
        )}
        {item.status === 'processing' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate(item.id, 'out_for_delivery')}
          >
            <Text style={styles.actionButtonText}>Ship</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderOrderDetailsModal = () => (
    <Modal
      visible={showOrderDetails}
      animationType="slide"
      onRequestClose={() => setShowOrderDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {selectedOrder && (
          <ScrollView style={styles.modalContent}>
            {/* Order Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                {renderStatusBadge(selectedOrder.status)}
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.detailValue}>₹{selectedOrder.totalAmount}</Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedOrder.customerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedOrder.customerEmail}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedOrder.customerPhone}</Text>
              </View>
            </View>

            {/* Delivery Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {typeof selectedOrder.deliveryAddress === 'string' 
                    ? selectedOrder.deliveryAddress
                    : `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}`
                  }
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Slot:</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.deliverySlot.date} • {selectedOrder.deliverySlot.time}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {selectedOrder.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.product.unit}
                  </Text>
                  <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                </View>
              ))}
            </View>

            {/* Status Update Buttons */}
            <View style={styles.statusUpdateSection}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.statusButtons}>
                {statusOptions.slice(1).map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusButton,
                      {backgroundColor: status.color},
                      selectedOrder.status === status.key && styles.currentStatus,
                    ]}
                    onPress={() => handleStatusUpdate(selectedOrder.id, status.key)}
                    disabled={selectedOrder.status === status.key}
                  >
                    <Text style={styles.statusButtonText}>{status.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.orderStats}>
          <Text style={styles.statsText}>
            {filteredOrders.length} orders
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.filterTab,
              selectedStatus === status.key && {backgroundColor: status.color},
            ]}
            onPress={() => setSelectedStatus(status.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedStatus === status.key && styles.activeFilterTabText,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {ordersLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          style={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}

      {/* Order Details Modal */}
      {renderOrderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterTabs: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliverySlot: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
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
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusUpdateSection: {
    marginTop: 24,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  currentStatus: {
    opacity: 0.5,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OrderManagementScreen;
