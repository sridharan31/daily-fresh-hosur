 // src/navigation/MainTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import ProfileScreen from '../../src/screens/auth/ProfileScreen';
import CartScreen from '../../src/screens/cart/CartScreen';
import CheckoutScreen from '../../src/screens/cart/CheckoutScreen';
import DeliverySlotScreen from '../../src/screens/delivery/DeliverySlotScreen';
import CategoryScreen from '../../src/screens/home/CategoryScreen';
import HomeScreen from '../../src/screens/home/HomeScreen';
import ProductDetailsScreen from '../../src/screens/home/ProductDetailsScreen';
import SearchScreen from '../../src/screens/home/SearchScreen';
import OrderDetailsScreen from '../../src/screens/orders/OrderDetailsScreen';
import OrderHistoryScreen from '../../src/screens/orders/OrderHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Category" component={CategoryScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="DeliverySlot" component={DeliverySlotScreen} />
  </Stack.Navigator>
);

const OrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'CartTab') iconName = 'shopping-cart';
          else if (route.name === 'OrdersTab') iconName = 'receipt';
          else if (route.name === 'ProfileTab') iconName = 'person';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{title: 'Home'}} />
      <Tab.Screen name="CartTab" component={CartStack} options={{title: 'Cart'}} />
      <Tab.Screen name="OrdersTab" component={OrderStack} options={{title: 'Orders'}} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{title: 'Profile'}} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
