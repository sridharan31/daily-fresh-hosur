 
// src/screens/admin/AnalyticsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { fetchAnalytics } from '../../../lib/store/slices/adminSlice';

const {width} = Dimensions.get('window');

interface analytics {
  salesOverview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growthRate: number;
  };
  salesTrend: {
    labels: string[];
    data: number[];
  };
  categoryPerformance: {
    name: string;
    revenue: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[];
  topProducts: {
    labels: string[];
    data: number[];
  };
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
  };
  deliveryMetrics: {
    onTimeDeliveries: number;
    totalDeliveries: number;
    averageDeliveryTime: number;
  };
}

const AnalyticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {analytics, analyticsLoading} = useSelector((state: RootState) => state.admin);
  
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const periods = [
    {key: '7days', label: '7 Days'},
    {key: '30days', label: '30 Days'},
    {key: '90days', label: '3 Months'},
    {key: 'year', label: 'Year'},
  ];

  const metrics = [
    {key: 'revenue', label: 'Revenue', icon: 'attach-money'},
    {key: 'orders', label: 'Orders', icon: 'shopping-cart'},
    {key: 'customers', label: 'Customers', icon: 'people'},
    {key: 'delivery', label: 'Delivery', icon: 'local-shipping'},
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = () => {
    const dateRange = {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    };
    dispatch(fetchAnalytics({ dateRange, type: 'sales' }));
  };

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

  const renderKPICard = (title: string, value: string, change: string, icon: string, color: string) => (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.kpiChange, {color}]}>{change}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.activePeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.activePeriodButtonText,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricTabs}>
      {metrics.map((metric) => (
        <TouchableOpacity
          key={metric.key}
          style={[
            styles.metricTab,
            selectedMetric === metric.key && styles.activeMetricTab,
          ]}
          onPress={() => setSelectedMetric(metric.key)}
        >
          <Icon
            name={metric.icon}
            size={20}
            color={selectedMetric === metric.key ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.metricTabText,
              selectedMetric === metric.key && styles.activeMetricTabText,
            ]}
          >
            {metric.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (analyticsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="analytics" size={64} color="#ccc" />
        <Text style={styles.errorText}>No analytics data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        {renderPeriodSelector()}
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        {renderKPICard(
          'Total Revenue',
          `₹${analytics.revenueMetrics?.totalRevenue?.toLocaleString() || 0}`,
          `+${analytics.revenueMetrics?.revenueGrowth || 0}%`,
          'attach-money',
          '#4CAF50'
        )}
        {renderKPICard(
          'Total Orders',
          analytics.revenueMetrics?.totalRevenue ? 
            Math.round((analytics.revenueMetrics.totalRevenue / (analytics.revenueMetrics.averageOrderValue || 1))).toString() : '0',
          '+12%',
          'shopping-cart',
          '#2196F3'
        )}
        {renderKPICard(
          'Avg Order Value',
          `₹${analytics.revenueMetrics?.averageOrderValue || 0}`,
          '+8%',
          'trending-up',
          '#FF9800'
        )}
        {renderKPICard(
          'Customer Retention',
          `${100 - (analytics.customerData?.churnRate || 0)}%`,
          '+5%',
          'people',
          '#9C27B0'
        )}
      </View>

      {/* Metric Tabs */}
      {renderMetricTabs()}

      {/* Revenue Trend Chart */}
      {selectedMetric === 'revenue' && analytics.salesData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <LineChart
            data={{
              labels: analytics.salesData.labels,
              datasets: [
                {
                  data: analytics.salesData.datasets[0]?.data || [],
                },
              ],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Order Analytics */}
      {selectedMetric === 'orders' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Order Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {analytics.revenueMetrics?.totalRevenue ? 
                  Math.round(analytics.revenueMetrics.totalRevenue / (analytics.revenueMetrics.averageOrderValue || 1)) : 0}
              </Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {analytics.revenueMetrics?.totalRevenue ? 
                  Math.round((analytics.revenueMetrics.totalRevenue / (analytics.revenueMetrics.averageOrderValue || 1)) / 30) : 0}
              </Text>
              <Text style={styles.statLabel}>Avg Daily Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>Order Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2.3</Text>
              <Text style={styles.statLabel}>Avg Items per Order</Text>
            </View>
          </View>
        </View>
      )}

      {/* Category Performance */}
      {selectedMetric === 'revenue' && analytics.productPerformance && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Category Performance</Text>
          <PieChart
            data={analytics.productPerformance.categories.map((category, index) => ({
              name: category.name,
              population: category.sales,
              color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'][index % 5],
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            }))}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="revenue"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Top Products */}
      {analytics.productPerformance && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top Selling Products</Text>
          <BarChart
            data={{
              labels: analytics.productPerformance.topProducts.map(p => p.name.substring(0, 8)),
              datasets: [
                {
                  data: analytics.productPerformance.topProducts.map(p => p.sales),
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
        </View>
      )}

      {/* Customer Metrics */}
      {selectedMetric === 'customers' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Customer Insights</Text>        <View style={styles.customerMetrics}>
          <View style={styles.customerMetricCard}>
            <Text style={styles.customerMetricValue}>
              {analytics.customerData?.newCustomers || 0}
            </Text>
            <Text style={styles.customerMetricLabel}>New Customers</Text>
          </View>
          <View style={styles.customerMetricCard}>
            <Text style={styles.customerMetricValue}>
              {analytics.customerData?.returningCustomers || 0}
            </Text>
            <Text style={styles.customerMetricLabel}>Returning Customers</Text>
          </View>
        </View>
        
        <View style={styles.retentionChart}>
          <Text style={styles.retentionTitle}>Customer Retention Rate</Text>
          <View style={styles.retentionBar}>
            <View
              style={[
                styles.retentionFill,
                {
                  width: `${100 - (analytics.customerData?.churnRate || 0)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.retentionValue}>
            {100 - (analytics.customerData?.churnRate || 0)}%
          </Text>
        </View>
        </View>
      )}

      {/* Delivery Metrics */}
      {selectedMetric === 'delivery' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Delivery Performance</Text>
          <View style={styles.deliveryMetrics}>
            <View style={styles.deliveryMetricCard}>
              <Text style={styles.deliveryMetricValue}>
                95.2%
              </Text>
              <Text style={styles.deliveryMetricLabel}>On-Time Delivery Rate</Text>
            </View>
            <View style={styles.deliveryMetricCard}>
              <Text style={styles.deliveryMetricValue}>
                2.5h
              </Text>
              <Text style={styles.deliveryMetricLabel}>Avg Delivery Time</Text>
            </View>
          </View>
        </View>
      )}

      {/* Export Options */}
      <View style={styles.exportContainer}>
        <Text style={styles.exportTitle}>Export Reports</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportButton}>
            <Icon name="file-download" size={20} color="#4CAF50" />
            <Text style={styles.exportButtonText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <Icon name="table-chart" size={20} color="#4CAF50" />
            <Text style={styles.exportButtonText}>Export Excel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
  },
  metricTabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeMetricTab: {
    backgroundColor: '#4CAF50',
  },
  metricTabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeMetricTabText: {
    color: '#fff',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  customerMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  customerMetricCard: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  customerMetricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  customerMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  retentionChart: {
    alignItems: 'center',
  },
  retentionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  retentionBar: {
    width: width - 64,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  retentionFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  retentionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  deliveryMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  deliveryMetricCard: {
    flex: 1,
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deliveryMetricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  deliveryMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  exportContainer: {
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
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  exportButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  // Common styles for all screens
  addButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterTab: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#fff',
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
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;
