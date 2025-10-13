// src/screens/admin/AdminDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { fetchDashboardData } from '../../../lib/store/slices/adminSlice';

const {width} = Dimensions.get('window');

interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
}

const AdminDashboardScreen: React.FC<{navigation: NavigationProps}> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {dashboardData, loading: isLoading} = useSelector((state: RootState) => state.admin);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    dispatch(fetchDashboardData(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {borderRadius: 16},
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const renderStatsCard = (
    title: string, 
    value: string | number, 
    icon: string, 
    color: string, 
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={[styles.statsCard, {borderLeftColor: color}]} 
      onPress={onPress}
    >
      <View style={styles.statsCardContent}>
        <View>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={styles.statsValue}>{value}</Text>
        </View>
        <Icon name={icon} size={32} color={color} />
      </View>
    </TouchableOpacity>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['today', 'week', 'month'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.activePeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.activePeriodButtonText,
            ]}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        {renderPeriodSelector()}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {renderStatsCard(
          'Total Orders',
          dashboardData?.orders?.total || 0,
          'shopping-cart',
          '#2196F3',
          () => navigation.navigate('OrderManagement')
        )}
        {renderStatsCard(
          'Revenue',
          `₹${dashboardData?.revenue?.total || 0}`,
          'attach-money',
          '#4CAF50',
          () => navigation.navigate('Analytics')
        )}
        {renderStatsCard(
          'Active Users',
          dashboardData?.users?.active || 0,
          'people',
          '#FF9800',
          () => navigation.navigate('CustomerManagement')
        )}
        {renderStatsCard(
          'Products',
          dashboardData?.products?.total || 0,
          'inventory',
          '#9C27B0',
          () => navigation.navigate('ProductManagement')
        )}
      </View>

      {/* Order Status Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Order Status Distribution</Text>
        {dashboardData?.orderStatus && (
          <PieChart
            data={[
              {
                name: 'Pending',
                count: dashboardData.orderStatus.pending,
                color: '#FF9800',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              },
              {
                name: 'Processing',
                count: dashboardData.orderStatus.processing,
                color: '#2196F3',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              },
              {
                name: 'Delivered',
                count: dashboardData.orderStatus.delivered,
                color: '#4CAF50',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              },
              {
                name: 'Cancelled',
                count: dashboardData.orderStatus.cancelled,
                color: '#F44336',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              },
            ]}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
      </View>

      {/* Sales Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        {dashboardData?.salesTrend && (
          <LineChart
            data={{
              labels: dashboardData.salesTrend.labels,
              datasets: [
                {
                  data: dashboardData.salesTrend.data,
                },
              ],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Top Products Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top Selling Products</Text>
        {dashboardData?.topProducts && (
          <BarChart
            data={{
              labels: dashboardData.topProducts.labels,
              datasets: [
                {
                  data: dashboardData.topProducts.data,
                },
              ],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductManagement', {screen: 'AddProduct'})}
          >
            <Icon name="add-box" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Add Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SlotManagement')}
          >
            <Icon name="schedule" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Manage Slots</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Inventory', {screen: 'LowStock'})}
          >
            <Icon name="warning" size={24} color="#FF9800" />
            <Text style={styles.actionButtonText}>Low Stock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Icon name="analytics" size={24} color="#9C27B0" />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  statsGrid: {
    padding: 16,
    gap: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  quickActions: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AdminDashboardScreen; 
// Example Admin Component: app/screens/admin/AdminDashboardScreen.tsx
/*
import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useAdmin} from '../../hooks/useAdmin';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import RecentOrdersList from '../../components/admin/RecentOrdersList';
import QuickActions from '../../components/admin/QuickActions';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminDashboardScreen: React.FC = () => {
  const {
    dashboardData,
    loading,
    error,
    getDashboardData,
  } = useAdmin();

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  const handleRefresh = () => {
    getDashboardData();
  };

  if (loading && !dashboardData) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {dashboardData && (
        <>
          <View style={styles.statsContainer}>
            <AdminStatsCard
              title="Today's Orders"
              value={dashboardData.todayStats.orders.toString()}
              subtitle={`${dashboardData.todayStats.revenue} AED revenue`}
              icon="receipt-long"
              color="#4CAF50"
            />
            <AdminStatsCard
              title="Active Customers"
              value={dashboardData.activeCustomers.toString()}
              subtitle="This month"
              icon="people"
              color="#2196F3"
            />
            <AdminStatsCard
              title="Low Stock Items"
              value={dashboardData.lowStockItems.toString()}
              subtitle="Require attention"
              icon="warning"
              color="#FF9800"
            />
            <AdminStatsCard
              title="Pending Orders"
              value={dashboardData.pendingOrders.toString()}
              subtitle="Awaiting processing"
              icon="schedule"
              color="#F44336"
            />
          </View>

          <QuickActions />

          <RecentOrdersList orders={dashboardData.recentOrders} />
        </>
      )}

      {error && (
        <Text style={styles.errorText}>
          Error loading dashboard: {error}
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    margin: 20,
  },
});

export default AdminDashboardScreen; '*/
