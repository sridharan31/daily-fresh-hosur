// src/screens/admin/AdminDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { fetchDashboardData } from '../../../lib/store/slices/adminSlice';

const {width} = Dimensions.get('window');

interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
}

// Simple stats card without complex animations
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}> = ({ title, value, icon, color, onPress }) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    className="bg-white p-4 rounded-xl border-l-4 shadow-sm mb-3"
    style={{borderLeftColor: color}}
    onPress={onPress}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-sm text-gray-600 mb-1">{title}</Text>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      </View>
      <Icon name={icon} size={32} color={color} />
    </View>
  </TouchableOpacity>
);

const AdminDashboardScreen: React.FC<{navigation: NavigationProps}> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {dashboardData, loading: isLoading} = useSelector((state: RootState) => state.admin);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    dispatch(fetchDashboardData(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  const chartConfig: any = {
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

  const renderPeriodSelector = () => (
    <View className="flex-row bg-gray-100 rounded-lg p-1 mx-2">
      {['today', 'week', 'month'].map((period) => (
        <TouchableOpacity
          key={period}
          activeOpacity={0.8}
          hitSlop={{top:8,left:8,right:8,bottom:8}}
          className={`flex-1 py-2 px-3 rounded-md items-center ${selectedPeriod === period ? 'bg-green-600' : ''}`}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text className={`text-sm font-medium ${selectedPeriod === period ? 'text-white' : 'text-gray-700'}`}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[1, 2, 3].map((i) => (
              <View key={i} className="flex-1 h-10 bg-gray-200 rounded-md mx-1 animate-pulse" />
            ))}
          </View>
        </View>
        <View className="px-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="bg-white p-4 rounded-xl mb-3 animate-pulse">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="h-4 bg-gray-200 rounded mb-2 w-24" />
                  <View className="h-6 bg-gray-200 rounded w-16" />
                </View>
                <View className="w-8 h-8 bg-gray-200 rounded" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</Text>
        {renderPeriodSelector()}
      </View>

      {/* Stats Cards */}
      <View className="px-4 py-4">
        <StatsCard
          title="Total Orders"
          value={dashboardData?.orders?.total || 0}
          icon="shopping-cart"
          color="#2196F3"
          onPress={() => navigation.navigate('OrderManagement')}
        />
        <StatsCard
          title="Revenue"
          value={`₹${dashboardData?.revenue?.total || 0}`}
          icon="attach-money"
          color="#4CAF50"
          onPress={() => navigation.navigate('Analytics')}
        />
        <StatsCard
          title="Active Users"
          value={dashboardData?.users?.active || 0}
          icon="people"
          color="#FF9800"
          onPress={() => navigation.navigate('CustomerManagement')}
        />
        <StatsCard
          title="Products"
          value={dashboardData?.products?.total || 0}
          icon="inventory"
          color="#9C27B0"
          onPress={() => navigation.navigate('ProductManagement')}
        />
      </View>

      {/* Order Status Chart */}
      <View className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</Text>
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
      <View className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Sales Trend</Text>
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
          />
        )}
      </View>

      {/* Top Products Chart */}
      <View className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm">
                <Text className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</Text>
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
            yAxisLabel=""
            yAxisSuffix=""
          />
        )}
      </View>

      {/* Quick Actions */}
      <View className="bg-white mx-4 mb-6 p-4 rounded-xl shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{top:8,left:8,right:8,bottom:8}}
            className="flex-1 min-w-[45%] bg-white border border-gray-200 p-4 rounded-lg items-center justify-center"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Icon name="add-box" size={24} color="#4CAF50" />
            <Text className="text-xs text-gray-800 mt-2 font-medium">Add Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{top:8,left:8,right:8,bottom:8}}
            className="flex-1 min-w-[45%] bg-white border border-gray-200 p-4 rounded-lg items-center justify-center"
            onPress={() => navigation.navigate('SlotManagement')}
          >
            <Icon name="schedule" size={24} color="#2196F3" />
            <Text className="text-xs text-gray-800 mt-2 font-medium">Manage Slots</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{top:8,left:8,right:8,bottom:8}}
            className="flex-1 min-w-[45%] bg-white border border-gray-200 p-4 rounded-lg items-center justify-center"
            onPress={() => navigation.navigate('Inventory')}
          >
            <Icon name="warning" size={24} color="#FF9800" />
            <Text className="text-xs text-gray-800 mt-2 font-medium">Low Stock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{top:8,left:8,right:8,bottom:8}}
            className="flex-1 min-w-[45%] bg-white border border-gray-200 p-4 rounded-lg items-center justify-center"
            onPress={() => navigation.navigate('Reports')}
          >
            <Icon name="analytics" size={24} color="#9C27B0" />
            <Text className="text-xs text-gray-800 mt-2 font-medium">View Reports</Text>
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
