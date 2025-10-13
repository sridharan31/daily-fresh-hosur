 // app/store/middleware/apiMiddleware.ts
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { createListenerMiddleware, isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import Config from '../../../src/config/environment';
import pushNotificationService from '../../services/push/pushNotificationService';
import { logout } from '../slices/authSlice';
import { RootState } from '../store';

// Create API middleware
export const apiMiddleware = createListenerMiddleware();

// Network error handler
apiMiddleware.startListening({
  matcher: isRejected,
  effect: async (action, listenerApi) => {
    const error = action.error || action.payload as any;
    
    // Handle different types of errors
    if (error?.code === 'NETWORK_ERROR') {
      // Show network error notification
      await pushNotificationService.showLocalNotification({
        notification: {
          title: 'Network Error',
          body: 'Please check your internet connection and try again.',
        },
        data: {
          type: 'custom',
        },
      } as any);
      
      // Log network error
      if (Config.ENABLE_ANALYTICS) {
        await analytics().logEvent('network_error', {
          action_type: action.type,
          error_message: error.message,
        });
      }
    }
    
    // Handle API errors
    if (error?.code === 'API_ERROR') {
      const statusCode = (error as any).statusCode;
      
      switch (statusCode) {
        case 401:
          // Unauthorized - logout user
          console.log('Unauthorized access, logging out');
          listenerApi.dispatch(logout());
          break;
          
        case 403:
          // Forbidden
          Alert.alert(
            'Access Denied',
            'You do not have permission to perform this action.',
            [{text: 'OK'}]
          );
          break;
          
        case 404:
          // Not found
          if (!action.type.includes('fetch')) { // Don't show for fetch operations
            Alert.alert(
              'Not Found',
              'The requested resource was not found.',
              [{text: 'OK'}]
            );
          }
          break;
          
        case 422:
          // Validation error - usually handled by individual components
          break;
          
        case 429:
          // Rate limiting
          Alert.alert(
            'Too Many Requests',
            'Please wait a moment before trying again.',
            [{text: 'OK'}]
          );
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          Alert.alert(
            'Server Error',
            'Something went wrong on our end. Please try again later.',
            [{text: 'OK'}]
          );
          
          // Log server errors to crashlytics
          if (Config.ENABLE_CRASHLYTICS) {
            crashlytics().recordError(new Error(`Server Error ${statusCode}: ${error.message}`));
          }
          break;
          
        default:
          // Generic error
          if (Config.ENABLE_DEBUG_LOGS) {
            console.error('API Error:', error);
          }
      }
      
      // Log API errors to analytics
      if (Config.ENABLE_ANALYTICS && statusCode >= 500) {
        await analytics().logEvent('api_error', {
          status_code: statusCode,
          action_type: action.type,
          error_message: error.message,
          endpoint: (error as any).endpoint || 'unknown',
        });
      }
    }
    
    // Log critical errors to crashlytics
    if (Config.ENABLE_CRASHLYTICS && (error as any)?.statusCode >= 500) {
      crashlytics().recordError(error as Error);
    }
  },
});

// Success response handler for analytics
apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled') && 
           (action.type.includes('create') || 
            action.type.includes('update') || 
            action.type.includes('delete'));
  },
  effect: async (action, listenerApi) => {
    if (Config.ENABLE_ANALYTICS) {
      const actionType = action.type.replace('/fulfilled', '');
      const [slice, operation] = actionType.split('/');
      
      await analytics().logEvent('api_success', {
        slice: slice,
        operation: operation,
        timestamp: Date.now(),
      });
    }
  },
});

// Handle cart synchronization
apiMiddleware.startListening({
  actionCreator: require('../slices/cartSlice').addToCart,
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as RootState;
      
      if (state.auth.isAuthenticated) {
        // Sync cart with server in background
        const {syncCartWithServer} = await import('../slices/cartSlice');
        listenerApi.dispatch(syncCartWithServer());
      }
      
      // Log cart event to analytics
      if (Config.ENABLE_ANALYTICS) {
        await analytics().logEvent('add_to_cart', {
          item_id: action.payload.product.id,
          item_name: action.payload.product.name,
          item_category: action.payload.product.category,
          quantity: action.payload.quantity || 1,
          value: action.payload.product.price,
          currency: Config.DEFAULT_CURRENCY,
        });
      }
    } catch (error) {
      console.error('Error in cart sync:', error);
    }
  },
});

// Handle order creation analytics
apiMiddleware.startListening({
  actionCreator: require('../slices/orderSlice').createOrder.fulfilled,
  effect: async (action, listenerApi) => {
    try {
      const order = action.payload;
      
      // Log purchase event to analytics
      if (Config.ENABLE_ANALYTICS) {
        await analytics().logPurchase({
          transaction_id: order.id,
          value: order.total,
          currency: Config.DEFAULT_CURRENCY,
          items: order.items.map((item: any) => ({
            item_id: item.productId,
            item_name: item.name,
            item_category: item.category,
            quantity: item.quantity,
            price: item.price,
          })),
        });
        
        // Log additional order details
        await analytics().logEvent('order_placed', {
          order_id: order.id,
          order_value: order.total,
          delivery_type: order.deliverySlot.type,
          payment_method: order.paymentMethod,
          item_count: order.items.length,
          delivery_charge: order.deliveryCharge,
          discount_applied: order.discount > 0,
          discount_amount: order.discount,
        });
      }
      
      // Send order confirmation notification
      await pushNotificationService.showLocalNotification({
        notification: {
          title: 'Order Confirmed!',
          body: `Your order #${order.orderNumber} has been placed successfully.`,
        },
        data: {
          type: 'order_placed',
          orderId: order.id,
        },
      } as any);
      
      console.log('Order created successfully:', order.id);
    } catch (error) {
      console.error('Error in order creation handler:', error);
    }
  },
});

// Handle product search analytics
apiMiddleware.startListening({
  actionCreator: require('../slices/productSlice').searchProducts.fulfilled,
  effect: async (action, listenerApi) => {
    try {
      if (Config.ENABLE_ANALYTICS) {
        const searchResults = action.payload;
        const searchQuery = action.meta.arg.query;
        
        await analytics().logEvent('search', {
          search_term: searchQuery,
          results_count: searchResults.length,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error in search analytics:', error);
    }
  },
});

// Handle location updates for delivery optimization
apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.includes('delivery') && action.type.endsWith('/fulfilled');
  },
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as RootState;
      
      // Update delivery charges based on location - with safe property access
      const delivery = (state as any).delivery;
      const cart = (state as any).cart;
      
      if (delivery?.selectedAddress && cart?.items?.length > 0) {
        try {
          // Try to import delivery calculator if it exists
          const deliveryCalculatorModule = await import('../../services/business/deliveryCalculator').catch(() => null);
          
          if (deliveryCalculatorModule?.default) {
            const estimate = await deliveryCalculatorModule.default.getDeliveryEstimate(
              delivery.selectedAddress.coordinates,
              cart.totalAmount || 0
            );
            
            if (estimate.isDeliveryAvailable) {
              const {setDeliveryCharge} = await import('../slices/cartSlice');
              listenerApi.dispatch(setDeliveryCharge(estimate.deliveryCharge));
            }
          }
        } catch (error) {
          console.warn('Delivery calculator not available:', error);
        }
      }
    } catch (error) {
      console.error('Error in delivery update handler:', error);
    }
  },
});

// Performance monitoring
apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/pending');
  },
  effect: async (action, listenerApi) => {
    if (Config.ENABLE_PERFORMANCE_MONITORING) {
      try {
        // Start performance trace
        const actionType = action.type.replace('/pending', '');
        const trace = await require('@react-native-firebase/perf').default().startTrace(actionType);
        
        // Store trace reference for completion
        const meta = action.meta as any;
        if (meta?.requestId) {
          (global as any)[`trace_${meta.requestId}`] = trace;
        }
      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    }
  },
});

apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected');
  },
  effect: async (action, listenerApi) => {
    if (Config.ENABLE_PERFORMANCE_MONITORING) {
      try {
        // Complete performance trace
        const meta = action.meta as any;
        if (meta?.requestId) {
          const trace = (global as any)[`trace_${meta.requestId}`];
          if (trace) {
            await trace.stop();
            delete (global as any)[`trace_${meta.requestId}`];
          }
        }
      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    }
  },
});

// Error recovery mechanisms
apiMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const error = action.payload as any;
    
    // Auto-retry for specific network errors
    if (error?.code === 'NETWORK_ERROR' && 
        action.type.includes('fetch') && 
        !(action.meta as any)?.retryCount) {
      
      console.log('Auto-retrying failed request:', action.type);
      
      // Wait for 2 seconds before retry
      setTimeout(() => {
        try {
          const retryAction = {
            type: action.type.replace('/rejected', ''),
            payload: {
              ...(action.meta as any).arg,
              retryCount: 1,
            },
          };
          
          // Re-dispatch the action
          listenerApi.dispatch(retryAction);
        } catch (error) {
          console.warn('Failed to retry action:', error);
        }
      }, 2000);
    }
    
    // Handle cart sync errors by falling back to local storage
    if (action.type.includes('cart/sync') && (state as any).auth?.isAuthenticated) {
      console.log('Cart sync failed, using local cart data');
      // Cart data is already persisted locally, so no action needed
    }
  },
});

// Debug logging in development
if (Config.ENABLE_DEBUG_LOGS) {
  apiMiddleware.startListening({
    predicate: () => true,
    effect: (action, listenerApi) => {
      if (action.type.includes('auth') || 
          action.type.includes('cart') || 
          action.type.includes('order')) {
        console.log('Redux Action:', action.type, action.payload);
      }
    },
  });
}
