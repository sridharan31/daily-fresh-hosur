 // app/services/push/deepLinking.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

interface RouteInfo {
  screen: string;
  params: Record<string, any>;
}

interface ShareContent {
  title: string;
  message: string;
  url?: string;
  deepLink: string;
}

interface LogData {
  screen: string;
  params: Record<string, any>;
  timestamp: string;
}

class DeepLinkingService {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private isReady: boolean = false;
  private pendingUrl: string | null = null;

  // Initialize deep linking
  initialize(navigationRef: NavigationContainerRef<any>): void {
    this.navigationRef = navigationRef;
    
    // Handle URL when app is opened from link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('Initial URL:', url);
        this.handleDeepLink(url);
      }
    });

    // Handle URL when app is already running
    Linking.addEventListener('url', this.handleUrlEvent);
  }

  // Set navigation ready state
  setNavigationReady(isReady: boolean): void {
    this.isReady = isReady;
    
    // Process pending URL if navigation is ready
    if (isReady && this.pendingUrl) {
      this.handleDeepLink(this.pendingUrl);
      this.pendingUrl = null;
    }
  }

  // Handle URL event
  handleUrlEvent = (event: { url: string }): void => {
    console.log('URL event:', event.url);
    this.handleDeepLink(event.url);
  };

  // Parse and handle deep link
  handleDeepLink(url: string): void {
    if (!url) return;

    // If navigation is not ready, store the URL for later
    if (!this.isReady) {
      this.pendingUrl = url;
      return;
    }

    try {
      const route = this.parseDeepLink(url);
      if (route) {
        this.navigateToRoute(route);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  // Parse deep link URL
  parseDeepLink(url: string): RouteInfo | null {
    // Remove the scheme (groceryapp://)
    const cleanUrl = url.replace(/^groceryapp:\/\//, '');
    const [path, queryString] = cleanUrl.split('?');
    const params = this.parseQueryString(queryString);

    switch (path) {
      case 'product':
        return {
          screen: 'ProductDetails',
          params: { productId: params.id },
        };
      
      case 'category':
        return {
          screen: 'Category',
          params: { categoryId: params.id, categoryName: params.name },
        };
      
      case 'order':
        return {
          screen: 'OrderDetails',
          params: { orderId: params.id },
        };
      
      case 'tracking':
        return {
          screen: 'OrderTracking',
          params: { orderId: params.id },
        };
      
      case 'cart':
        return {
          screen: 'Cart',
          params: {},
        };
      
      case 'profile':
        return {
          screen: 'Profile',
          params: {},
        };
      
      case 'delivery-slots':
        return {
          screen: 'DeliverySlot',
          params: {},
        };
      
      case 'promotion':
        return {
          screen: 'Home',
          params: { promotionId: params.id },
        };
      
      case 'search':
        return {
          screen: 'Search',
          params: { query: params.q },
        };
      
      default:
        console.log('Unknown deep link path:', path);
        return null;
    }
  }

  // Parse query string
  parseQueryString(queryString?: string): Record<string, string> {
    if (!queryString) return {};
    
    const params: Record<string, string> = {};
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    
    return params;
  }

  // Navigate to route
  navigateToRoute(route: RouteInfo): void {
    if (!this.navigationRef || !this.isReady) {
      console.log('Navigation not ready, storing route for later');
      return;
    }

    try {
      // Navigate to the specific screen
      (this.navigationRef as any).navigate(route.screen, route.params);
      
      // Log the navigation for analytics
      this.logDeepLinkNavigation(route);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to the requested page.');
    }
  }

  // Generate deep link URLs
  generateDeepLink(path: string, params: Record<string, any> = {}): string {
    let url = `groceryapp://${path}`;
    
    const queryParams = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    if (queryParams) {
      url += `?${queryParams}`;
    }
    
    return url;
  }

  // Generate shareable links
  generateShareableLink(type: string, id: string, additionalParams: Record<string, any> = {}): string {
    const baseUrl = 'https://yourapp.com'; // Your web app URL
    
    switch (type) {
      case 'product':
        return `${baseUrl}/product/${id}`;
      
      case 'category':
        return `${baseUrl}/category/${id}`;
      
      case 'promotion':
        return `${baseUrl}/promotion/${id}`;
      
      default:
        return `${baseUrl}`;
    }
  }

  // Log deep link navigation for analytics
  async logDeepLinkNavigation(route: RouteInfo): Promise<void> {
    try {
      const logData: LogData = {
        screen: route.screen,
        params: route.params,
        timestamp: new Date().toISOString(),
      };
      
      // Store locally for analytics
      const existingLogs = await AsyncStorage.getItem('deep_link_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logData);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('deep_link_logs', JSON.stringify(logs));
      
      // Send to analytics service if available
      // analyticsService.trackDeepLink(logData);
    } catch (error) {
      console.error('Error logging deep link navigation:', error);
    }
  }

  // Open external URL
  openExternalUrl(url: string): void {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    });
  }

  // Share product
  shareProduct(productId: string, productName: string): ShareContent {
    const deepLink = this.generateDeepLink('product', { id: productId });
    const shareableLink = this.generateShareableLink('product', productId);
    
    return {
      title: `Check out ${productName}`,
      message: `I found this great product on our grocery app: ${productName}`,
      url: shareableLink,
      deepLink: deepLink,
    };
  }

  // Share order
  shareOrder(orderId: string): ShareContent {
    const deepLink = this.generateDeepLink('order', { id: orderId });
    
    return {
      title: 'Order Confirmation',
      message: `My order #${orderId} has been placed successfully!`,
      deepLink: deepLink,
    };
  }

  // Handle notification deep links
  handleNotificationDeepLink(notificationData: Record<string, any>): string {
    const { type, ...params } = notificationData;
    
    switch (type) {
      case 'order_update':
        return this.generateDeepLink('order', { id: params.orderId });
      
      case 'delivery_update':
        return this.generateDeepLink('tracking', { id: params.orderId });
      
      case 'promotion':
        return this.generateDeepLink('promotion', { id: params.promotionId });
      
      case 'slot_reminder':
        return this.generateDeepLink('delivery-slots');
      
      default:
        return this.generateDeepLink('');
    }
  }

  // Cleanup
  cleanup(): void {
    // Note: removeEventListener is deprecated, use the subscription pattern instead
    // This would be handled by the subscription returned from addEventListener
  }
}

export default new DeepLinkingService();
