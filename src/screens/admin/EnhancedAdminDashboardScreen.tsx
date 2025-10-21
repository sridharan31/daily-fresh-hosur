import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminLowStockProducts, fetchAdminOrders, fetchAdminTopSellingProducts } from '../../../lib/supabase/store/actions/adminActions';
import { fetchDashboardData } from '../../../lib/supabase/store/adminSlice';
import { RootState } from '../../../lib/supabase/store/rootReducer';
import { AdminOrder, AdminProduct } from '../../../lib/types/admin';

// Mock chart component - in real app, use a chart library
const BarChart = ({ data }: { data: Array<{ label: string; value: number }> }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.chartBarContainer}>
          <View 
            style={[
              styles.chartBar, 
              { 
                height: Math.max((item.value / maxValue) * 100, 5),
                backgroundColor: `rgba(33, 150, 243, ${0.5 + (item.value / maxValue) * 0.5})`
              }
            ]} 
          />
          <Text style={styles.chartLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const AdminDashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { dashboardData, loading, error, products, orders } = useSelector((state: RootState) => state.admin);
  
  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchDashboardData('today') as any);
    dispatch(fetchAdminTopSellingProducts(5) as any);
    dispatch(fetchAdminLowStockProducts(10) as any);
    dispatch(fetchAdminOrders({ page: 1, limit: 5 }) as any);
  }, [dispatch]);
  
  const navigateToProducts = () => {
    router.push('/admin/products');
  };
  
  const navigateToOrders = () => {
    router.push('/admin/orders');
  };
  
  const navigateToCustomers = () => {
    router.push('/admin/customers');
  };
  
  const renderSummaryCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <View style={[styles.cardIcon, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.iconText, { color }]}>
          {icon}
        </Text>
      </View>
    </View>
  );
  
  const renderOrderStatus = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: '#FF9800',
      processing: '#2196F3',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      confirmed: '#9C27B0',
    };
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColors[status] || '#9E9E9E' }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };
  
  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }
  
  if (error && !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchDashboardData('today') as any)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Provide fallback values in case dashboardData is null
  const summary = {
    totalOrders: dashboardData?.orders?.total || 0,
    totalRevenue: dashboardData?.revenue?.total || 0,
    totalCustomers: dashboardData?.users?.total || 0,
    pendingOrders: dashboardData?.orders?.pending || 0,
  };
  
  // Convert sales trend data to the format expected by BarChart
  const salesData = dashboardData?.salesTrend ? 
    dashboardData.salesTrend.labels.map((label, index) => ({
      label,
      value: dashboardData.salesTrend.data[index] || 0
    })) : [];
    
  // Create category data from analytics or use default
  const categoryData = [
    { name: 'Vegetables', orders: dashboardData?.orders?.total ? Math.round(dashboardData.orders.total * 0.4) : 0, percentage: 40 },
    { name: 'Fruits', orders: dashboardData?.orders?.total ? Math.round(dashboardData.orders.total * 0.3) : 0, percentage: 30 },
    { name: 'Dairy', orders: dashboardData?.orders?.total ? Math.round(dashboardData.orders.total * 0.2) : 0, percentage: 20 },
    { name: 'Other', orders: dashboardData?.orders?.total ? Math.round(dashboardData.orders.total * 0.1) : 0, percentage: 10 },
  ];
  const recentOrders = orders?.slice(0, 5) || [];
  const topProducts = products?.slice(0, 5) || [];
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {renderSummaryCard('Total Orders', summary.totalOrders, '📦', '#2196F3')}
        {renderSummaryCard('Revenue', `₹${summary.totalRevenue.toFixed(2)}`, '💰', '#4CAF50')}
        {renderSummaryCard('Customers', summary.totalCustomers, '👥', '#FF9800')}
        {renderSummaryCard('Pending', summary.pendingOrders, '⏳', '#F44336')}
      </View>
      
      {/* Sales Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales This Week</Text>
        </View>
        <BarChart data={salesData} />
      </View>
      
      {/* Top Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          <TouchableOpacity onPress={navigateToProducts}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {topProducts.length > 0 ? (
          <View>
            {topProducts.map((product: AdminProduct, index: number) => (
              <View key={index} style={styles.productItem}>
                <Image 
                  source={{ uri: product.images[0] || 'https://via.placeholder.com/50' }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>
                    {product.totalSold} sold | ₹{product.revenue.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.productPrice}>₹{product.price}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No products data available</Text>
        )}
      </View>
      
      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={navigateToOrders}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentOrders.length > 0 ? (
          <View>
            {recentOrders.map((order: AdminOrder, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderTotal}>₹{order.total.toFixed(2)}</Text>
                  {renderOrderStatus(order.status)}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No recent orders</Text>
        )}
      </View>
      
      {/* Sales by Category */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales by Category</Text>
        </View>
        
        {categoryData.length > 0 ? (
          <View>
            {categoryData.map((category: { name: string; orders: number; percentage: number }, index: number) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryOrders}>{category.orders} orders</Text>
                </View>
                <View style={styles.percentageContainer}>
                  <View style={styles.percentageBar}>
                    <View 
                      style={[
                        styles.percentageFill, 
                        { width: `${category.percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.percentageText}>{category.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No category data available</Text>
        )}
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsSectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToProducts}>
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionText}>Manage Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToOrders}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Process Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToCustomers}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Customers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2 - 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#2196F3',
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 180,
  },
  chartBar: {
    width: '60%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
  },
  productMeta: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontWeight: 'bold',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontWeight: 'bold',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontWeight: 'bold',
  },
  categoryOrders: {
    fontSize: 12,
    color: '#666',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: (width - 48) / 3 - 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AdminDashboardScreen;