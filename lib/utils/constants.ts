 // app/utils/constants.ts
export const APP_CONFIG = {
  NAME: 'FreshMart',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.freshmart.grocery',
  STORE_URL: {
    IOS: 'https://apps.apple.com/app/freshmart',
    ANDROID: 'https://play.google.com/store/apps/details?id=com.freshmart.grocery',
  },
  SUPPORT_EMAIL: 'support@freshmart.ae',
  SUPPORT_PHONE: '+971-4-123-4567',
  WEBSITE: 'https://freshmart.ae',
  PRIVACY_POLICY: 'https://freshmart.ae/privacy',
  TERMS_OF_SERVICE: 'https://freshmart.ae/terms',
};

export const UAE_CONFIG = {
  CURRENCY: 'AED',
  VAT_RATE: 0.05, // 5%
  FREE_DELIVERY_THRESHOLD: 100,
  EXPRESS_DELIVERY_CHARGE: 15,
  STANDARD_DELIVERY_CHARGE: 5,
  MAX_DELIVERY_DISTANCE: 25, // km
  SUPPORTED_EMIRATES: [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
  ],
  LANGUAGES: [
    {code: 'en', name: 'English', nativeName: 'English'},
    {code: 'ar', name: 'Arabic', nativeName: 'العربية'},
  ],
};

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  PACKED: 'packed',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const DELIVERY_SLOTS = {
  MORNING: {start: '06:00', end: '12:00', label: 'Morning (6 AM - 12 PM)'},
  AFTERNOON: {start: '12:00', end: '18:00', label: 'Afternoon (12 PM - 6 PM)'},
  EVENING: {start: '18:00', end: '22:00', label: 'Evening (6 PM - 10 PM)'},
} as const;

export const PRODUCT_CATEGORIES = [
  {id: 'fresh-vegetables', name: 'Fresh Vegetables', icon: 'eco'},
  {id: 'fresh-fruits', name: 'Fresh Fruits', icon: 'local-florist'},
  {id: 'organic', name: 'Organic Products', icon: 'nature'},
  {id: 'dairy', name: 'Dairy Products', icon: 'local-drink'},
  {id: 'bakery', name: 'Bakery', icon: 'cake'},
  {id: 'meat-seafood', name: 'Meat & Seafood', icon: 'restaurant'},
  {id: 'pantry', name: 'Pantry Essentials', icon: 'kitchen'},
  {id: 'beverages', name: 'Beverages', icon: 'local-cafe'},
  {id: 'frozen', name: 'Frozen Foods', icon: 'ac-unit'},
  {id: 'household', name: 'Household Items', icon: 'home'},
] as const;

export const PAYMENT_METHODS = [
  {id: 'card', name: 'Credit/Debit Card', icon: 'credit-card'},
  {id: 'apple-pay', name: 'Apple Pay', icon: 'phone-iphone'},
  {id: 'google-pay', name: 'Google Pay', icon: 'android'},
  {id: 'paypal', name: 'PayPal', icon: 'account-balance-wallet'},
  {id: 'cod', name: 'Cash on Delivery', icon: 'money'},
] as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_UAE: /^(\+971|971|0)?[5][0-9]{8}$/,
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  PINCODE_UAE: /^[0-9]{5}$/,
  CARD_NUMBER: /^[0-9]{13,19}$/,
  CVV: /^[0-9]{3,4}$/,
} as const;
