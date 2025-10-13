// app/navigation/navigationTypes.ts (Updated with new types)
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Root Navigator Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

// Auth Navigator Types (Updated)
export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: {
    email?: string;
    fromScreen?: string;
  };
  Register: {
    email?: string;
    referralCode?: string;
  };
  ForgotPassword: undefined;
  OTPVerification: {
    email: string;
    phone?: string;
    type: 'email' | 'phone' | 'registration' | 'password_reset';
    token: string;
  };
  ResetPassword: {
    token: string;
    email: string;
  };
  TermsAndConditions: {
    fromScreen?: string;
  };
  PrivacyPolicy: {
    fromScreen?: string;
  };
};

// Main App Navigator Types
export type MainTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Category: {categoryId: string; categoryName: string};
  ProductDetails: {productId: string};
  Search: {query?: string};
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  DeliverySlot: undefined;
  OrderConfirmation: {orderId: string};
};

export type OrderStackParamList = {
  OrderHistory: undefined;
  OrderDetails: {orderId: string};
  OrderTracking: {orderId: string};
};

// Admin Navigator Types (New)
export type AdminStackParamList = {
  AdminTabs: undefined;
  
  // Product Management
  AddProduct: undefined;
  EditProduct: {productId: string};
  ProductDetails: {productId: string};
  CategoryManagement: undefined;
  BulkProductUpdate: undefined;
  
  // Order Management
  OrderDetails: {orderId: string};
  OrderTracking: {orderId: string};
  RefundManagement: undefined;
  
  // Customer Management
  CustomerDetails: {customerId: string};
  CustomerCommunication: {customerId: string};
  LoyaltyManagement: undefined;
  
  // Inventory Management
  StockAlerts: undefined;
  SupplierManagement: undefined;
  StockMovement: undefined;
  
  // Analytics
  SalesReports: undefined;
  CustomerReports: undefined;
  ProductReports: undefined;
  DeliveryReports: undefined;
  
  // Settings
  AdminProfile: undefined;
  AdminSettings: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Customers: undefined;
  Inventory: undefined;
  Analytics: undefined;
};

export type AdminDrawerParamList = {
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
  SlotManagement: undefined;
  Reports: undefined;
  Logout: undefined;
};

// Navigation Prop Types
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Auth Navigation Props
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;

// Main App Navigation Props
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type CartNavigationProp = NativeStackNavigationProp<CartStackParamList>;
export type OrderNavigationProp = NativeStackNavigationProp<OrderStackParamList>;

// Main App Route Props
export type HomeRouteProp<T extends keyof HomeStackParamList> = RouteProp<HomeStackParamList, T>;
export type CartRouteProp<T extends keyof CartStackParamList> = RouteProp<CartStackParamList, T>;
export type OrderRouteProp<T extends keyof OrderStackParamList> = RouteProp<OrderStackParamList, T>;

// Admin Navigation Props
export type AdminNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
export type AdminTabNavigationProp = BottomTabNavigationProp<AdminTabParamList>;
export type AdminDrawerNavigationProp = DrawerNavigationProp<AdminDrawerParamList>;

// Admin Route Props
export type AdminRouteProp<T extends keyof AdminStackParamList> = RouteProp<AdminStackParamList, T>;
export type AdminTabRouteProp<T extends keyof AdminTabParamList> = RouteProp<AdminTabParamList, T>;

// Generic Navigation Helper Types
export interface NavigationParams {
  [key: string]: any;
}

export interface ScreenProps<
  TParamList extends Record<string, object | undefined>,
  TRouteName extends keyof TParamList
> {
  navigation: NativeStackNavigationProp<TParamList, TRouteName>;
  route: RouteProp<TParamList, TRouteName>;
}

// Screen Component Type Helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> = ScreenProps<AuthStackParamList, T>;
export type AdminScreenProps<T extends keyof AdminStackParamList> = ScreenProps<AdminStackParamList, T>;
export type HomeScreenProps<T extends keyof HomeStackParamList> = ScreenProps<HomeStackParamList, T>;
export type CartScreenProps<T extends keyof CartStackParamList> = ScreenProps<CartStackParamList, T>;
export type OrderScreenProps<T extends keyof OrderStackParamList> = ScreenProps<OrderStackParamList, T>;

// ============================================================================

// Default export for Expo Router compatibility
export default function NavigationTypesRouteNotFound() {
  return null;
}

