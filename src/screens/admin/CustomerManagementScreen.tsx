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
import { fetchAdminCustomers } from '../../../lib/store/slices/adminSlice';
import { AdminCustomer } from '../../../lib/types/admin';

const CustomerManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, customersLoading } = useSelector((state: RootState) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const segments = [
    { key: 'all', label: 'All Customers', color: '#666' },
    { key: 'new', label: 'New', color: '#4CAF50' },
    { key: 'regular', label: 'Regular', color: '#2196F3' },
    { key: 'vip', label: 'VIP', color: '#FF9800' },
    { key: 'inactive', label: 'Inactive', color: '#9E9E9E' },
  ];

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = useCallback(() => {
    dispatch(fetchAdminCustomers({}));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  }, [loadCustomers]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  const getCustomerSegmentColor = (segment: string) => {
    const segmentData = segments.find(s => s.key === segment);
    return segmentData?.color || '#666';
  };

  const handleCustomerDetails = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleToggleStatus = (customer: AdminCustomer) => {
    const action = customer.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      'Update Customer Status',
      `Are you sure you want to ${action} ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // In a real app, you would dispatch an action to update customer status
            Alert.alert('Success', `Customer ${action}d successfully`);
          },
        },
      ]
    );
  };

  const renderCustomerStats = () => {
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => c.segment === 'new').length;
    const regularCustomers = customers.filter(c => c.segment === 'regular').length;
    const vipCustomers = customers.filter(c => c.segment === 'vip').length;
    const averageOrderValue = customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / (totalCustomers || 1);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCustomers}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{newCustomers}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{regularCustomers}</Text>
          <Text style={styles.statLabel}>Regular</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{vipCustomers}</Text>
          <Text style={styles.statLabel}>VIP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{Math.round(averageOrderValue)}</Text>
          <Text style={styles.statLabel}>Avg Order</Text>
        </View>
      </View>
    );
  };

  const renderCustomerItem = ({ item }: { item: AdminCustomer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerDetails(item)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerEmail}>{item.email}</Text>
            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={styles.customerActions}>
          <View style={[styles.segmentBadge, { backgroundColor: getCustomerSegmentColor(item.segment) }]}>
            <Text style={styles.segmentText}>{item.segment.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(item)}
          >
            <Icon
              name={item.isActive ? "person" : "person-off"}
              size={20}
              color={item.isActive ? "#4CAF50" : "#9E9E9E"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.customerMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{item.totalOrders}</Text>
          <Text style={styles.metricLabel}>Orders</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>₹{item.totalSpent.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>Total Spent</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>₹{item.averageOrderValue.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>Avg Order</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{item.loyaltyPoints}</Text>
          <Text style={styles.metricLabel}>Points</Text>
        </View>
      </View>

      <Text style={styles.registrationDate}>
        Joined: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Customer Details</Text>
          <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {selectedCustomer && (
          <ScrollView style={styles.modalContent}>
            {/* Customer Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.customerProfileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{selectedCustomer.name}</Text>
                  <Text style={styles.profileEmail}>{selectedCustomer.email}</Text>
                  <Text style={styles.profilePhone}>{selectedCustomer.phone}</Text>
                  <View style={[styles.profileSegment, { backgroundColor: getCustomerSegmentColor(selectedCustomer.segment) }]}>
                    <Text style={styles.profileSegmentText}>{selectedCustomer.segment.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Order History Summary */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{selectedCustomer.totalOrders}</Text>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>₹{selectedCustomer.totalSpent.toFixed(0)}</Text>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>₹{selectedCustomer.averageOrderValue.toFixed(0)}</Text>
                  <Text style={styles.summaryLabel}>Average Order</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{selectedCustomer.loyaltyPoints}</Text>
                  <Text style={styles.summaryLabel}>Loyalty Points</Text>
                </View>
              </View>
            </View>

            {/* Account Details */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Account Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registration Source:</Text>
                <Text style={styles.detailValue}>{selectedCustomer.registrationSource}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Status:</Text>
                <Text style={[styles.detailValue, { color: selectedCustomer.isActive ? '#4CAF50' : '#F44336' }]}>
                  {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedCustomer.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="history" size={20} color="#2196F3" />
                <Text style={styles.actionBtnText}>View Order History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="email" size={20} color="#4CAF50" />
                <Text style={styles.actionBtnText}>Send Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="card-giftcard" size={20} color="#FF9800" />
                <Text style={styles.actionBtnText}>Add Loyalty Points</Text>
              </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Customer Management</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="file-download" size={20} color="#4CAF50" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {renderCustomerStats()}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Segment Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {segments.map((segment) => (
          <TouchableOpacity
            key={segment.key}
            style={[
              styles.filterChip,
              selectedSegment === segment.key && { backgroundColor: segment.color },
            ]}
            onPress={() => setSelectedSegment(segment.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSegment === segment.key && styles.activeFilterChipText,
              ]}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Customers List */}
      {customersLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id}
          style={styles.customersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          }
        />
      )}

      {/* Customer Details Modal */}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  exportText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
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
  customersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  customerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
  },
  customerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  segmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  segmentText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  customerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
  },
  registrationDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
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
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  customerProfileCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileSegment: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileSegmentText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actionSection: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionBtnText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default CustomerManagementScreen;

