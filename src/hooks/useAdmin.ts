// app/hooks/useAdmin.ts (New hook for admin functionality)
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import {
  fetchAdminCustomers,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAnalytics,
  fetchDashboardData,
  setDateRange,
  setOrderFilter,
  updateOrderStatus,
  updateProductStatus,
} from '../../lib/store/slices/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    dashboardData,
    orders,
    products,
    customers,
    analytics,
    loading,
    ordersLoading,
    productsLoading,
    customersLoading,
    analyticsLoading,
    error,
    selectedDateRange,
    filters,
  } = useSelector((state: RootState) => state.admin);

  const getDashboardData = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const getOrders = useCallback(
    (params?: any) => {
      dispatch(fetchAdminOrders(params));
    },
    [dispatch]
  );

  const getProducts = useCallback(
    (params?: any) => {
      dispatch(fetchAdminProducts(params));
    },
    [dispatch]
  );

  const getCustomers = useCallback(
    (params?: any) => {
      dispatch(fetchAdminCustomers(params));
    },
    [dispatch]
  );

  const getAnalytics = useCallback(
    (params: any) => {
      dispatch(fetchAnalytics(params));
    },
    [dispatch]
  );

  const changeOrderStatus = useCallback(
    (orderId: string, status: string, notes?: string) => {
      return dispatch(updateOrderStatus({orderId, status, notes}));
    },
    [dispatch]
  );

  const changeProductStatus = useCallback(
    (productId: string, isActive: boolean) => {
      return dispatch(updateProductStatus({productId, isActive}));
    },
    [dispatch]
  );

  const setAnalyticsDateRange = useCallback(
    (range: {from: string; to: string}) => {
      dispatch(setDateRange(range));
    },
    [dispatch]
  );

  const setOrderStatusFilter = useCallback(
    (status: string) => {
      dispatch(setOrderFilter(status));
    },
    [dispatch]
  );

  return {
    dashboardData,
    orders,
    products,
    customers,
    analytics,
    loading,
    ordersLoading,
    productsLoading,
    customersLoading,
    analyticsLoading,
    error,
    selectedDateRange,
    filters,
    getDashboardData,
    getOrders,
    getProducts,
    getCustomers,
    getAnalytics,
    changeOrderStatus,
    changeProductStatus,
    setAnalyticsDateRange,
    setOrderStatusFilter,
  };
};


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
