 import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: {token: string; email: string};
};

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

export type AdminStackParamList = {
  Dashboard: undefined;
  ProductManagement: undefined;
  OrderManagement: undefined;
  Inventory: undefined;
  SlotManagement: undefined;
  CustomerManagement: undefined;
  Analytics: undefined;
};

// Navigation prop types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type CartNavigationProp = NativeStackNavigationProp<CartStackParamList>;

// Route prop types
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type HomeRouteProp<T extends keyof HomeStackParamList> = RouteProp<HomeStackParamList, T>;

