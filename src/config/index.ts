 // app/config/index.ts
import { API_ENDPOINTS, apiConfig, HTTP_METHODS, HTTP_STATUS } from './apiConfig';
import Config, { type EnvironmentConfig } from './environment';
import { PAYMENT_ERROR_CODES, paymentConfig } from './paymentConfig';
import { DEEP_LINK_MAPPINGS, NOTIFICATION_TYPES, pushConfig } from './pushConfig';

// Re-export all configurations
export default Config;

export {
    API_ENDPOINTS,
    // API Configuration
    apiConfig, DEEP_LINK_MAPPINGS, HTTP_METHODS, HTTP_STATUS, NOTIFICATION_TYPES, PAYMENT_ERROR_CODES,
    // Payment Configuration
    paymentConfig,
    // Push Notification Configuration
    pushConfig,
    // Environment
    type EnvironmentConfig
};

// App constants
export const APP_CONSTANTS = {
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@grocery_app/auth_token',
    USER_DATA: '@grocery_app/user_data',
    CART_DATA: '@grocery_app/cart_data',
    RECENT_SEARCHES: '@grocery_app/recent_searches',
    FAVORITE_PRODUCTS: '@grocery_app/favorite_products',
    DELIVERY_ADDRESSES: '@grocery_app/delivery_addresses',
    NOTIFICATION_SETTINGS: '@grocery_app/notification_settings',
    APP_SETTINGS: '@grocery_app/app_settings',
    ONBOARDING_COMPLETED: '@grocery_app/onboarding_completed',
  },
  
  // Cache keys
  CACHE_KEYS: {
    CATEGORIES: 'categories',
    FEATURED_PRODUCTS: 'featured_products',
    POPULAR_PRODUCTS: 'popular_products',
    DELIVERY_AREAS: 'delivery_areas',
    APP_CONFIG: 'app_config',
  },
  
  // Cache durations (in milliseconds)
  CACHE_DURATIONS: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Image dimensions
  IMAGE_SIZES: {
    THUMBNAIL: {width: 150, height: 150},
    SMALL: {width: 300, height: 300},
    MEDIUM: {width: 600, height: 600},
    LARGE: {width: 1200, height: 1200},
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PHONE_NUMBER_LENGTH: 10,
    OTP_LENGTH: 6,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Business rules
  BUSINESS_RULES: {
    MIN_ORDER_VALUE: 100, // INR
    MAX_CART_ITEMS: Config.MAX_CART_ITEMS,
    FREE_DELIVERY_THRESHOLD: Config.FREE_DELIVERY_THRESHOLD,
    ORDER_CANCELLATION_WINDOW: Config.ORDER_CANCELLATION_WINDOW,
    DELIVERY_SLOT_BOOKING_ADVANCE_DAYS: 7,
    MAX_DELIVERY_ATTEMPTS: 3,
    PRODUCT_RETURN_WINDOW_DAYS: 2,
  },
  
  // UI Constants
  UI: {
    HEADER_HEIGHT: 60,
    TAB_BAR_HEIGHT: 80,
    BORDER_RADIUS: {
      SMALL: 4,
      MEDIUM: 8,
      LARGE: 12,
      EXTRA_LARGE: 16,
    },
    SPACING: {
      XS: 4,
      SM: 8,
      MD: 16,
      LG: 24,
      XL: 32,
    },
    COLORS: {
      PRIMARY: '#4CAF50',
      SECONDARY: '#FF9800',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      GRAY_LIGHT: '#F5F5F5',
      GRAY_MEDIUM: '#E0E0E0',
      GRAY_DARK: '#757575',
      TEXT_PRIMARY: '#212121',
      TEXT_SECONDARY: '#757575',
      BACKGROUND: '#FAFAFA',
    },
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Please check your internet connection and try again.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
  },
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: Config.ENABLE_ANALYTICS,
  ENABLE_CRASHLYTICS: Config.ENABLE_CRASHLYTICS,
  ENABLE_PERFORMANCE_MONITORING: Config.ENABLE_PERFORMANCE_MONITORING,
  ENABLE_VOICE_SEARCH: true,
  ENABLE_BARCODE_SCANNER: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_LOYALTY_PROGRAM: true,
  ENABLE_SUBSCRIPTION_SERVICE: false,
  ENABLE_LIVE_CHAT: true,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_AR_PRODUCT_VIEW: false,
  ENABLE_SMART_RECOMMENDATIONS: true,
} as const;

// Regional settings for India (Tamil Nadu)
export const REGIONAL_SETTINGS = {
  COUNTRY: 'IN',
  COUNTRY_NAME: 'India',
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  LANGUAGE: 'en',
  TIMEZONE: 'Asia/Kolkata',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: '12h',
  FIRST_DAY_OF_WEEK: 1, // Monday
  WEEKEND_DAYS: [0, 6], // Sunday, Saturday
  PHONE_CODE: '+91',
  EMERGENCY_NUMBER: '112',
  VAT_RATE: 0.18, // 18% GST
  DISTANCE_UNIT: 'km',
  WEIGHT_UNIT: 'kg',
} as const;
