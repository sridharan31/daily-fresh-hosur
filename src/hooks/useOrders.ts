import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import {
  cancelOrder,
  clearCurrentOrder,
  createOrder,
  fetchOrderById,
  fetchOrders,
  trackOrder,
} from '../../lib/store/slices/orderSlice';
import { OrderStatus } from '../../lib/types/order';

export const useOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    currentOrder,
    orderTracking,
    loading,
    creating,
    error,
    pagination,
  } = useSelector((state: RootState) => state.order);

  const placeOrder = useCallback(
    (orderData: any) => {
      return dispatch(createOrder(orderData));
    },
    [dispatch]
  );

  const getOrders = useCallback(
    (params?: {page?: number; limit?: number; status?: OrderStatus}) => {
      dispatch(fetchOrders(params || {}));
    },
    [dispatch]
  );

  const getOrderById = useCallback(
    (orderId: string) => {
      dispatch(fetchOrderById(orderId));
    },
    [dispatch]
  );

  const cancelOrderById = useCallback(
    (orderId: string, reason: string) => {
      return dispatch(cancelOrder({orderId, reason}));
    },
    [dispatch]
  );

  const trackOrderById = useCallback(
    (orderId: string) => {
      dispatch(trackOrder(orderId));
    },
    [dispatch]
  );

  const clearOrder = useCallback(() => {
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  // Auto-refresh orders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (orders.length > 0) {
        getOrders();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [orders.length, getOrders]);

  return {
    orders,
    currentOrder,
    orderTracking,
    loading,
    creating,
    error,
    pagination,
    placeOrder,
    getOrders,
    getOrderById,
    cancelOrderById,
    trackOrderById,
    clearOrder,
  };
};


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
