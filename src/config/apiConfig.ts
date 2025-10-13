 // app/config/apiConfig.ts
import Config from './environment';

export interface ApiEndpoints {
  // Authentication
  LOGIN: string;
  REGISTER: string;
  LOGOUT: string;
  REFRESH_TOKEN: string;
  VERIFY_OTP: string;
  FORGOT_PASSWORD: string;
  RESET_PASSWORD: string;
  CHANGE_PASSWORD: string;

  // User Profile
  PROFILE: string;
  UPDATE_PROFILE: string;
  UPLOAD_AVATAR: string;
  ADDRESSES: string;
  ADD_ADDRESS: string;
  UPDATE_ADDRESS: string;
  DELETE_ADDRESS: string;

  // Products
  PRODUCTS: string;
  PRODUCT_DETAILS: (id: string) => string;
  CATEGORIES: string;
  SEARCH_PRODUCTS: string;
  PRODUCT_SUGGESTIONS: string;
  POPULAR_PRODUCTS: string;
  FEATURED_PRODUCTS: string;

  // Cart
  CART: string;
  ADD_TO_CART: string;
  UPDATE_CART_ITEM: string;
  REMOVE_FROM_CART: (itemId: string) => string;
  CLEAR_CART: string;
  APPLY_COUPON: string;
  REMOVE_COUPON: string;

  // Orders
  ORDERS: string;
  CREATE_ORDER: string;
  ORDER_DETAILS: (id: string) => string;
  CANCEL_ORDER: (id: string) => string;
  TRACK_ORDER: (id: string) => string;
  ORDER_HISTORY: string;
  REORDER: (id: string) => string;

  // Delivery
  DELIVERY_SLOTS: string;
  BOOK_SLOT: string;
  DELIVERY_AREAS: string;
  CHECK_DELIVERY_AVAILABILITY: string;
  DELIVERY_CHARGES: string;
  TRACK_DELIVERY: (orderId: string) => string;

  // Payment
  CREATE_PAYMENT_INTENT: string;
  VERIFY_PAYMENT: string;
  PAYMENT_METHODS: string;
  ADD_PAYMENT_METHOD: string;
  DELETE_PAYMENT_METHOD: (id: string) => string;
  PROCESS_REFUND: string;

  // Coupons
  AVAILABLE_COUPONS: string;
  VALIDATE_COUPON: string;
  USER_COUPONS: string;

  // Notifications
  REGISTER_DEVICE: string;
  UNREGISTER_DEVICE: string;
  NOTIFICATION_PREFERENCES: string;
  UPDATE_NOTIFICATION_PREFERENCES: string;

  // Admin (if user has admin role)
  ADMIN_DASHBOARD: string;
  ADMIN_PRODUCTS: string;
  ADMIN_ORDERS: string;
  ADMIN_CUSTOMERS: string;
  ADMIN_ANALYTICS: string;
  ADMIN_INVENTORY: string;
  ADMIN_COUPONS: string;

  // Miscellaneous
  APP_CONFIG: string;
  CONTACT_SUPPORT: string;
  FAQ: string;
  TERMS_CONDITIONS: string;
  PRIVACY_POLICY: string;
}

export const API_ENDPOINTS: ApiEndpoints = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',

  // User Profile
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  UPLOAD_AVATAR: '/user/avatar',
  ADDRESSES: '/user/addresses',
  ADD_ADDRESS: '/user/addresses',
  UPDATE_ADDRESS: '/user/addresses',
  DELETE_ADDRESS: '/user/addresses',

  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  SEARCH_PRODUCTS: '/products/search',
  PRODUCT_SUGGESTIONS: '/products/suggestions',
  POPULAR_PRODUCTS: '/products/popular',
  FEATURED_PRODUCTS: '/products/featured',

  // Cart
  CART: '/cart',
  ADD_TO_CART: '/cart/items',
  UPDATE_CART_ITEM: '/cart/items',
  REMOVE_FROM_CART: (itemId: string) => `/cart/items/${itemId}`,
  CLEAR_CART: '/cart/clear',
  APPLY_COUPON: '/cart/coupon',
  REMOVE_COUPON: '/cart/coupon',

  // Orders
  ORDERS: '/orders',
  CREATE_ORDER: '/orders',
  ORDER_DETAILS: (id: string) => `/orders/${id}`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  TRACK_ORDER: (id: string) => `/orders/${id}/track`,
  ORDER_HISTORY: '/orders/history',
  REORDER: (id: string) => `/orders/${id}/reorder`,

  // Delivery
  DELIVERY_SLOTS: '/delivery/slots',
  BOOK_SLOT: '/delivery/book-slot',
  DELIVERY_AREAS: '/delivery/areas',
  CHECK_DELIVERY_AVAILABILITY: '/delivery/check-availability',
  DELIVERY_CHARGES: '/delivery/charges',
  TRACK_DELIVERY: (orderId: string) => `/delivery/track/${orderId}`,

  // Payment
  CREATE_PAYMENT_INTENT: '/payment/create-intent',
  VERIFY_PAYMENT: '/payment/verify',
  PAYMENT_METHODS: '/payment/methods',
  ADD_PAYMENT_METHOD: '/payment/methods',
  DELETE_PAYMENT_METHOD: (id: string) => `/payment/methods/${id}`,
  PROCESS_REFUND: '/payment/refund',

  // Coupons
  AVAILABLE_COUPONS: '/coupons/available',
  VALIDATE_COUPON: '/coupons/validate',
  USER_COUPONS: '/coupons/user',

  // Notifications
  REGISTER_DEVICE: '/notifications/register-device',
  UNREGISTER_DEVICE: '/notifications/unregister-device',
  NOTIFICATION_PREFERENCES: '/notifications/preferences',
  UPDATE_NOTIFICATION_PREFERENCES: '/notifications/preferences',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_COUPONS: '/admin/coupons',

  // Miscellaneous
  APP_CONFIG: '/app/config',
  CONTACT_SUPPORT: '/support/contact',
  FAQ: '/content/faq',
  TERMS_CONDITIONS: '/content/terms',
  PRIVACY_POLICY: '/content/privacy',
};

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  defaultHeaders: Record<string, string>;
}

export const apiConfig: ApiConfig = {
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableLogging: Config.ENABLE_DEBUG_LOGS,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': Config.APP_VERSION,
    'X-Platform': 'mobile',
  },
};

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Request methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function ConfigRouteNotFound() { return null; }
