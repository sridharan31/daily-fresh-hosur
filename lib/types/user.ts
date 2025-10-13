// app/types/user.ts

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Address information
  addresses?: UserAddress[];
  defaultAddressId?: string;
  // Loyalty and rewards
  loyaltyPoints?: number;
  membershipTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  // Account status
  isActive: boolean;
  isBlocked: boolean;
  lastLoginAt?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  label: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  shopping?: ShoppingPreferences;
  delivery?: DeliveryPreferences;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotionalOffers: boolean;
  priceDrops: boolean;
  stockAlerts: boolean;
  deliveryUpdates?: boolean;
  weeklyOffers?: boolean;
  newProductAlerts?: boolean;
  accountSecurity?: boolean;
}

export interface PrivacyPreferences {
  shareDataForPersonalization: boolean;
  receiveMarketingEmails: boolean;
  shareDataWithPartners?: boolean;
  enableLocationTracking?: boolean;
  enableAnalytics?: boolean;
  enableCookies?: boolean;
}

export interface ShoppingPreferences {
  defaultDeliveryTime?: string;
  preferredCategories?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferredBrands?: string[];
  budgetRange?: {
    min: number;
    max: number;
  };
  autoReorderEnabled?: boolean;
  savePaymentMethods?: boolean;
}

export interface DeliveryPreferences {
  preferredDeliveryWindow?: string;
  deliveryInstructions?: string;
  contactlessDelivery?: boolean;
  allowSubstitutions?: boolean;
  substitutionPreferences?: {
    [productId: string]: string[];
  };
  preferredDeliveryAddress?: string;
}

export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  loading: boolean;
  updating: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyPoints: number;
  memberSince: string;
  favoriteCategories: string[];
  lastOrderDate?: string;
  deliveryAddressCount: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'order_placed' | 'profile_updated' | 'password_changed' | 'address_added' | 'wishlist_updated';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserWishlist {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    inStock: boolean;
  };
}

export interface UserReview {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isRecommended: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'order' | 'promotion' | 'system' | 'delivery' | 'account';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

// Request/Response types for API calls
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AddAddressRequest {
  type: 'home' | 'work' | 'other';
  label: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {
  id: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface UserSearchFilters {
  query?: string;
  isActive?: boolean;
  isBlocked?: boolean;
  membershipTier?: string;
  registeredAfter?: string;
  registeredBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  minimumOrders?: number;
  minimumSpent?: number;
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
