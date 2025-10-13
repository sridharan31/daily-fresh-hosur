 // app/config/pushConfig.ts
import Config from './environment';

export interface PushNotificationConfig {
  firebase: {
    enabled: boolean;
    config: typeof Config.FIREBASE_CONFIG;
    messagingSenderId: string;
    vapidKey?: string;
  };
  channels: {
    [key: string]: {
      id: string;
      name: string;
      description: string;
      importance: 'default' | 'high' | 'low' | 'min';
      sound: boolean;
      vibration: boolean;
      lights: boolean;
      badge: boolean;
    };
  };
  categories: {
    [key: string]: {
      id: string;
      actions: Array<{
        id: string;
        title: string;
        options?: {
          foreground?: boolean;
          destructive?: boolean;
          authenticationRequired?: boolean;
        };
      }>;
    };
  };
  defaultSettings: {
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    alert: boolean;
  };
}

export const pushConfig: PushNotificationConfig = {
  firebase: {
    enabled: true,
    config: Config.FIREBASE_CONFIG,
    messagingSenderId: Config.FIREBASE_CONFIG.messagingSenderId,
    vapidKey: 'your-vapid-key-for-web-push',
  },
  channels: {
    order_updates: {
      id: 'order_updates',
      name: 'Order Updates',
      description: 'Notifications about your order status',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      badge: true,
    },
    delivery_updates: {
      id: 'delivery_updates',
      name: 'Delivery Updates',
      description: 'Real-time delivery tracking notifications',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      badge: true,
    },
    promotions: {
      id: 'promotions',
      name: 'Offers & Promotions',
      description: 'Special deals and promotional offers',
      importance: 'default',
      sound: false,
      vibration: false,
      lights: false,
      badge: true,
    },
    payment_updates: {
      id: 'payment_updates',
      name: 'Payment Updates',
      description: 'Payment confirmations and refund notifications',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      badge: true,
    },
    general: {
      id: 'general',
      name: 'General Notifications',
      description: 'App updates and general information',
      importance: 'default',
      sound: false,
      vibration: false,
      lights: false,
      badge: true,
    },
    slot_reminders: {
      id: 'slot_reminders',
      name: 'Delivery Reminders',
      description: 'Reminders about upcoming delivery slots',
      importance: 'default',
      sound: true,
      vibration: false,
      lights: false,
      badge: true,
    },
  },
  categories: {
    order_actions: {
      id: 'order_actions',
      actions: [
        {
          id: 'track_order',
          title: 'Track Order',
          options: {
            foreground: true,
          },
        },
        {
          id: 'contact_support',
          title: 'Contact Support',
          options: {
            foreground: true,
          },
        },
      ],
    },
    delivery_actions: {
      id: 'delivery_actions',
      actions: [
        {
          id: 'view_location',
          title: 'View on Map',
          options: {
            foreground: true,
          },
        },
        {
          id: 'call_delivery',
          title: 'Call Delivery Person',
          options: {
            foreground: true,
          },
        },
      ],
    },
    promotion_actions: {
      id: 'promotion_actions',
      actions: [
        {
          id: 'view_offer',
          title: 'View Offer',
          options: {
            foreground: true,
          },
        },
        {
          id: 'dismiss',
          title: 'Dismiss',
          options: {
            destructive: false,
          },
        },
      ],
    },
  },
  defaultSettings: {
    sound: true,
    vibration: true,
    badge: true,
    alert: true,
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  // Order related
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PROCESSING: 'order_processing',
  ORDER_PACKED: 'order_packed',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Payment related
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  
  // Delivery related
  DELIVERY_ASSIGNED: 'delivery_assigned',
  DELIVERY_STARTED: 'delivery_started',
  DELIVERY_ARRIVING: 'delivery_arriving',
  DELIVERY_SLOT_REMINDER: 'delivery_slot_reminder',
  
  // Promotional
  NEW_OFFER: 'new_offer',
  COUPON_EXPIRING: 'coupon_expiring',
  FLASH_SALE: 'flash_sale',
  PERSONALIZED_OFFER: 'personalized_offer',
  
  // General
  APP_UPDATE: 'app_update',
  MAINTENANCE_NOTICE: 'maintenance_notice',
  CART_REMINDER: 'cart_reminder',
  REORDER_SUGGESTION: 'reorder_suggestion',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Deep link mappings
export const DEEP_LINK_MAPPINGS = {
  order_details: '/orders/:orderId',
  track_order: '/orders/:orderId/track',
  product_details: '/products/:productId',
  category: '/categories/:categoryId',
  offers: '/offers',
  cart: '/cart',
  profile: '/profile',
  support: '/support',
  payment_methods: '/profile/payment-methods',
} as const;


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function ConfigRouteNotFound() { return null; }
