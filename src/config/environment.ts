// app/config/environment.ts
interface EnvironmentConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  APP_ENV: 'development' | 'staging' | 'production';
  APP_VERSION: string;
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };

  // Payment Gateway Keys
  STRIPE_PUBLISHABLE_KEY: string;
  RAZORPAY_KEY_ID: string;
  PAYPAL_CLIENT_ID: string;

  // Google Services
  GOOGLE_MAPS_API_KEY: string;
  GOOGLE_PLACES_API_KEY: string;

  // External Services
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_PRESET: string;
  SMS_GATEWAY_KEY: string;
  EMAIL_SERVICE_KEY: string;

  // App Features
  ENABLE_ANALYTICS: boolean;
  ENABLE_CRASHLYTICS: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  ENABLE_DEBUG_LOGS: boolean;

  // Business Configuration
  DEFAULT_CURRENCY: string;
  DEFAULT_LANGUAGE: string;
  VAT_RATE: number;
  FREE_DELIVERY_THRESHOLD: number;
  MAX_CART_ITEMS: number;
  ORDER_CANCELLATION_WINDOW: number; // in minutes

  // Delivery Configuration
  DEFAULT_DELIVERY_RADIUS: number; // in km
  EXPRESS_DELIVERY_CHARGE: number;
  STANDARD_DELIVERY_CHARGE: number;
  MAX_DELIVERY_DISTANCE: number;
}

const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'http://localhost:3000/api', // Backend API server (Docker)
  API_TIMEOUT: 30000,
  APP_ENV: 'development',
  APP_VERSION: '1.0.0-dev',

  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyCJBzzHpQSqf2IhfU17Qlg3Y9Ds1j-DnC8',
    authDomain: 'grocery-app-e693a.firebaseapp.com',
    projectId: 'grocery-app-e693a',
    storageBucket: 'grocery-app-e693a.firebasestorage.app',
    messagingSenderId: '789669533205',
    appId: '1:789669533205:android:060d3d794ffaca3295a01c',
    measurementId: 'G-XXXXXXXXXX', // Add this when you enable Analytics
  },

  STRIPE_PUBLISHABLE_KEY: 'pk_test_51234567890abcdef',
  RAZORPAY_KEY_ID: 'rzp_test_1234567890',
  PAYPAL_CLIENT_ID: 'your-paypal-sandbox-client-id',

  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key',
  GOOGLE_PLACES_API_KEY: 'your-google-places-api-key',

  CLOUDINARY_CLOUD_NAME: 'your-cloudinary-cloud',
  CLOUDINARY_UPLOAD_PRESET: 'grocery_app_dev',
  SMS_GATEWAY_KEY: 'your-sms-gateway-key',
  EMAIL_SERVICE_KEY: 'your-email-service-key',

  ENABLE_ANALYTICS: false,
  ENABLE_CRASHLYTICS: false,
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_DEBUG_LOGS: true,

  DEFAULT_CURRENCY: 'AED',
  DEFAULT_LANGUAGE: 'en',
  VAT_RATE: 0.05, // 5% VAT in UAE
  FREE_DELIVERY_THRESHOLD: 100, // AED
  MAX_CART_ITEMS: 50,
  ORDER_CANCELLATION_WINDOW: 30, // 30 minutes

  DEFAULT_DELIVERY_RADIUS: 10, // 10 km
  EXPRESS_DELIVERY_CHARGE: 15, // AED
  STANDARD_DELIVERY_CHARGE: 5, // AED
  MAX_DELIVERY_DISTANCE: 25, // 25 km
};

const stagingConfig: EnvironmentConfig = {
  ...developmentConfig,
  API_BASE_URL: 'https://api-staging.groceryapp.ae/api',
  APP_ENV: 'staging',
  APP_VERSION: '1.0.0-staging',

  FIREBASE_CONFIG: {
    ...developmentConfig.FIREBASE_CONFIG,
    projectId: 'grocery-app-staging',
    authDomain: 'grocery-app-staging.firebaseapp.com',
    storageBucket: 'grocery-app-staging.appspot.com',
  },

  CLOUDINARY_UPLOAD_PRESET: 'grocery_app_staging',
  ENABLE_ANALYTICS: true,
  ENABLE_CRASHLYTICS: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_DEBUG_LOGS: false,
};

const productionConfig: EnvironmentConfig = {
  ...stagingConfig,
  API_BASE_URL: 'https://api.groceryapp.ae/api',
  APP_ENV: 'production',
  APP_VERSION: '1.0.0',

  FIREBASE_CONFIG: {
    apiKey: 'your-prod-firebase-api-key',
    authDomain: 'grocery-app-prod.firebaseapp.com',
    projectId: 'grocery-app-prod',
    storageBucket: 'grocery-app-prod.appspot.com',
    messagingSenderId: '987654321',
    appId: '1:987654321:android:fedcba987654',
    measurementId: 'G-YYYYYYYYYY',
  },

  STRIPE_PUBLISHABLE_KEY: 'pk_live_51234567890abcdef',
  RAZORPAY_KEY_ID: 'rzp_live_1234567890',
  PAYPAL_CLIENT_ID: 'your-paypal-live-client-id',

  CLOUDINARY_UPLOAD_PRESET: 'grocery_app_prod',
  ENABLE_DEBUG_LOGS: false,
};

// Determine current environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (__DEV__) {
    return 'development';
  }
  
  // You can add more sophisticated logic here based on bundle ID, build configuration, etc.
  const bundleId = require('react-native').NativeModules?.PlatformConstants?.bundleId || '';
  
  if (bundleId.includes('.staging')) {
    return 'staging';
  }
  
  return 'production';
};

const ENV = getEnvironment();

const Config: EnvironmentConfig = (() => {
  switch (ENV) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return developmentConfig;
  }
})();

export default Config;
export type { EnvironmentConfig };

