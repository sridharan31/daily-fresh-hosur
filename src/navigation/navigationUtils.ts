// app/navigation/navigationUtils.ts
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import React from 'react';
import { RootStackParamList } from './navigationTypes';

// Navigation reference for navigation outside of components
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

// Navigation helper functions
export const NavigationService = {
  // Navigate to a specific screen
  navigate: (name: string, params?: any) => {
    (navigationRef.current as any)?.navigate(name, params);
  },

  // Go back to previous screen
  goBack: () => {
    navigationRef.current?.goBack();
  },

  // Reset navigation stack
  reset: (routes: Array<{name: string; params?: any}>) => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: routes.length - 1,
        routes,
      })
    );
  },

  // Replace current screen
  replace: (name: string, params?: any) => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: name as any, params }],
      })
    );
  },

  // Get current route name
  getCurrentRoute: () => {
    return navigationRef.current?.getCurrentRoute();
  },

  // Check if navigation is ready
  isReady: () => {
    return navigationRef.current?.isReady() ?? false;
  },

  // Auth specific navigations
  navigateToAuth: () => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      })
    );
  },

  // Main app navigation
  navigateToMain: () => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Main'}],
      })
    );
  },

  // Admin navigation
  navigateToAdmin: () => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Admin'}],
      })
    );
  },

  // Deep linking helpers
  navigateToProduct: (productId: string) => {
    (navigationRef.current as any)?.navigate('Main', {
      screen: 'HomeTab',
      params: {
        screen: 'ProductDetails',
        params: {productId},
      },
    });
  },

  navigateToOrder: (orderId: string) => {
    (navigationRef.current as any)?.navigate('Main', {
      screen: 'OrdersTab',
      params: {
        screen: 'OrderDetails',
        params: {orderId},
      },
    });
  },

  // Admin deep linking
  navigateToAdminOrder: (orderId: string) => {
    (navigationRef.current as any)?.navigate('Admin', {
      screen: 'OrderDetails',
      params: {orderId},
    });
  },

  navigateToAdminProduct: (productId: string) => {
    (navigationRef.current as any)?.navigate('Admin', {
      screen: 'ProductDetails',
      params: {productId},
    });
  },

  navigateToAdminCustomer: (customerId: string) => {
    (navigationRef.current as any)?.navigate('Admin', {
      screen: 'CustomerDetails',
      params: {customerId},
    });
  },
};

// Hook for navigation in functional components
export const useNavigation = () => {
  return NavigationService;
};

// Screen tracking for analytics
export const screenTrackingListener = (state: any) => {
  const previousRouteName = getPreviousRouteName(state);
  const currentRouteName = getCurrentRouteName(state);

  if (previousRouteName !== currentRouteName) {
    // Track screen change for analytics
    console.log('Screen changed:', {
      from: previousRouteName,
      to: currentRouteName,
    });
    
    // Add your analytics tracking here
    // Analytics.track('screen_view', {
    //   screen_name: currentRouteName,
    //   previous_screen: previousRouteName,
    // });
  }
};

const getCurrentRouteName = (state: any): string | undefined => {
  if (!state || typeof state.index !== 'number') {
    return undefined;
  }

  const route = state.routes[state.index];

  if (route.state) {
    return getCurrentRouteName(route.state);
  }

  return route.name;
};

const getPreviousRouteName = (state: any): string | undefined => {
  // This would need to be implemented based on your analytics requirements
  // You might want to store the previous route name in a global state
  return undefined;
};

export { getCurrentRouteName, getPreviousRouteName };

// Default export for Expo Router compatibility
export default NavigationService;
