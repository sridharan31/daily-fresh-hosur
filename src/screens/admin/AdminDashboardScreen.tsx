// src/screens/admin/AdminDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { fetchDashboardData } from '../../../lib/store/slices/adminSlice';

const { width } = Dimensions.get('window');

interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
}

// Simple stats card without complex animations - Pure StyleSheet
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}> = ({ title, value, icon, color, onPress }) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    style={[styles.statsCard, { borderLeftColor: color }]}
    onPress={onPress}
  >
    <View style={styles.statsCardContent}>
      <View style={{ flex: 1 }}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Icon name={icon} size={32} color={color} />
    </View>
  </TouchableOpacity>
);

const AdminDashboardScreen: React.FC<{ navigation: NavigationProps }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardData, loading: isLoading } = useSelector((state: RootState) => state.admin);
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
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['today', 'week', 'month'].map((period) => (
        <TouchableOpacity
          key={period}
          activeOpacity={0.8}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
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
        <View style={styles.header}>
          <View style={styles.loadingPlaceholder} />
          <View style={styles.periodSelector}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.periodButton, { backgroundColor: '#e5e5e5' }]} />
            ))}
          </View>
        </View>
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.statsCard, { backgroundColor: '#e5e5e5' }]}>
              <View style={styles.statsCardContent}>
                <View style={{ flex: 1 }}>
                  <View style={styles.loadingPlaceholder} />
                  <View style={[styles.loadingPlaceholder, { width: '40%', marginTop: 8 }]} />
                </View>
                <View style={[styles.loadingPlaceholder, { width: 32, height: 32, borderRadius: 4 }]} />
              </View>
            </View>
          ))}
        </View>
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
            activeOpacity={0.85}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Icon name="add-box" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            style={styles.actionButton}
            onPress={() => navigation.navigate('SlotManagement')}
          >
            <Icon name="schedule" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Manage Slots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            style={styles.actionButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Icon name="warning" size={24} color="#FF9800" />
            <Text style={styles.actionButtonText}>Low Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#16a34a',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#4b5563',
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
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActions: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingPlaceholder: {
    height: 12,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
  },
});

export default AdminDashboardScreen;
