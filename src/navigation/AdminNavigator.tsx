// app/navigation/AdminNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { AdminLogoutModal } from '../../src/components/admin/AdminLogoutModal';

// Types
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
  AdminSecurity: undefined;
  AdminTwoFactor: undefined;
  
  // Admin User Management
  AdminUserManagement: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Customers: undefined;
  Inventory: undefined;
  AdminUsers: undefined;
};

export type AdminDrawerParamList = {
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
  SlotManagement: undefined;
  Reports: undefined;
  Logout: undefined;
};

// Admin Screens
import AdminDashboardScreen from '../../src/screens/admin/AdminDashboardScreen';
import AdminProfileScreen from '../../src/screens/admin/AdminProfileScreen';
import AdminSecurityScreen from '../../src/screens/admin/AdminSecurityScreen';
import AdminSettingsScreen from '../../src/screens/admin/AdminSettingsScreen';
import AdminTwoFactorScreen from '../../src/screens/admin/AdminTwoFactorScreen';
import AdminUserManagementScreen from '../../src/screens/admin/AdminUserManagementScreen';
import AnalyticsScreen from '../../src/screens/admin/AnalyticsScreen';
import CustomerManagementScreen from '../../src/screens/admin/CustomerManagementScreen';
import InventoryScreen from '../../src/screens/admin/InventoryScreen';
import OrderManagementScreen from '../../src/screens/admin/OrderManagementScreen';
import ProductManagementScreen from '../../src/screens/admin/ProductManagementScreen';
import SlotManagementScreen from '../../src/screens/admin/SlotManagementScreen';

// Sub-screens for detailed management
import AddProductScreen from '../../src/screens/admin/products/AddProductScreen';
import EditProductScreen from '../../src/screens/admin/products/EditProductScreen';
import ProductDetailsScreen from '../../src/screens/admin/products/ProductDetailsScreen';

// import OrderDetailsScreen from '../screens/admin/orders/OrderDetailsScreen';
// import OrderTrackingScreen from '../screens/admin/orders/OrderTrackingScreen';
// import RefundManagementScreen from '../screens/admin/orders/RefundManagementScreen';

// import CustomerCommunicationScreen from '../screens/admin/customers/CustomerCommunicationScreen';
// import CustomerDetailsScreen from '../screens/admin/customers/CustomerDetailsScreen';
// import LoyaltyManagementScreen from '../screens/admin/customers/LoyaltyManagementScreen';

// import StockAlertsScreen from '../screens/admin/inventory/StockAlertsScreen';
// import StockMovementScreen from '../screens/admin/inventory/StockMovementScreen';
// import SupplierManagementScreen from '../screens/admin/inventory/SupplierManagementScreen';

// import CustomerReportsScreen from '../screens/admin/analytics/CustomerReportsScreen';
// import DeliveryReportsScreen from '../screens/admin/analytics/DeliveryReportsScreen';
// import ProductReportsScreen from '../screens/admin/analytics/ProductReportsScreen';
// import SalesReportsScreen from '../screens/admin/analytics/SalesReportsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();
const Drawer = createDrawerNavigator<AdminDrawerParamList>();

// Custom Drawer Content
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = ({navigation}) => {
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth?.user;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const menuItems = [
    {
      id: 'main',
      title: 'Dashboard',
      icon: 'dashboard',
      onPress: () => navigation.navigate('Main'),
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'slot-management',
      title: 'Delivery Slots',
      icon: 'schedule',
      onPress: () => navigation.navigate('SlotManagement'),
    },
    {
      id: 'reports',
      title: 'Advanced Reports',
      icon: 'analytics',
      onPress: () => navigation.navigate('Reports'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={drawerStyles.container}>
      {/* Header */}
      <View style={drawerStyles.header}>
        <View style={drawerStyles.avatarContainer}>
          <Icon name="admin-panel-settings" size={40} color="#4CAF50" />
        </View>
        <Text style={drawerStyles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={drawerStyles.userRole}>Administrator</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={drawerStyles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={drawerStyles.menuItem}
            onPress={item.onPress}
          >
            <Icon name={item.icon} size={24} color="#666" />
            <Text style={drawerStyles.menuItemText}>{item.title}</Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={drawerStyles.footer}>
        <TouchableOpacity style={drawerStyles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#F44336" />
          <Text style={drawerStyles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      {/* Logout Modal */}
      <AdminLogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

// Admin Tab Navigator
const AdminTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Products':
              iconName = 'inventory';
              break;
            case 'Orders':
              iconName = 'receipt-long';
              break;
            case 'Customers':
              iconName = 'people';
              break;
            case 'Inventory':
              // use material icon that exists across platforms
              iconName = 'inventory';
              break;
            case 'AdminUsers':
              iconName = 'admin-panel-settings';
              break;
            default:
              iconName = 'dashboard';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#7C8798',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 68,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: {width: 0, height: -3},
          shadowRadius: 6,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{title: 'Dashboard'}}
      />
      <Tab.Screen
        name="Products"
        component={ProductManagementScreen}
        options={{title: 'Products'}}
      />
      <Tab.Screen
        name="Orders"
        component={OrderManagementScreen}
        options={{title: 'Orders'}}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerManagementScreen}
        options={{title: 'Customers'}}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{title: 'Inventory'}}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUserManagementScreen}
        options={{title: 'Admin Users'}}
      />
    </Tab.Navigator>
  );
};

// Admin Drawer Navigator
const AdminDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen name="Main" component={AdminTabNavigator} />
      <Drawer.Screen name="Profile" component={AdminProfileScreen} />
      <Drawer.Screen name="Settings" component={AdminSettingsScreen} />
      <Drawer.Screen name="SlotManagement" component={SlotManagementScreen} />
      <Drawer.Screen name="Reports" component={AnalyticsScreen} />
    </Drawer.Navigator>
  );
};

// Main Admin Navigator with Stack
const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#fff',
        },
        headerTintColor: '#fff',
      }}
    >
      {/* Main Admin Flow with Drawer */}
      <Stack.Screen
        name="AdminTabs"
        component={AdminDrawerNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Product Management Screens */}
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{
          title: 'Add New Product',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: 'Edit Product',
        }}
      />

      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          title: 'Product Details',
        }}
      />

      {/* <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagementScreen}
        options={{
          title: 'Manage Categories',
        }}
      />

      <Stack.Screen
        name="BulkProductUpdate"
        component={BulkProductUpdateScreen}
        options={{
          title: 'Bulk Update Products',
          presentation: 'modal',
        }}
      /> */}

      {/* Order Management Screens */}
      {/* <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />

      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          title: 'Track Order',
        }}
      /> */}

      {/* <Stack.Screen
        name="RefundManagement"
        component={RefundManagementScreen}
        options={{
          title: 'Manage Refunds',
        }}
      />

      {/* Customer Management Screens */}
      {/* <Stack.Screen
        name="CustomerDetails"
        component={CustomerDetailsScreen}
        options={{
          title: 'Customer Details',
        }}
      /> 

      <Stack.Screen
        name="CustomerCommunication"
        component={CustomerCommunicationScreen}
        options={{
          title: 'Customer Communication',
        }}
      />

      <Stack.Screen
        name="LoyaltyManagement"
        component={LoyaltyManagementScreen}
        options={{
          title: 'Loyalty Program',
        }}
      /> */}

      {/* Inventory Management Screens */}
      {/* <Stack.Screen
        name="StockAlerts"
        component={StockAlertsScreen}
        options={{
          title: 'Stock Alerts',
        }}
      />

      <Stack.Screen
        name="SupplierManagement"
        component={SupplierManagementScreen}
        options={{
          title: 'Manage Suppliers',
        }}
      /> */}

      {/* <Stack.Screen
        name="StockMovement"
        component={StockMovementScreen}
        options={{
          title: 'Stock Movement',
        }}
      />

      {/* Analytics Screens */}
      {/* <Stack.Screen
        name="SalesReports"
        component={SalesReportsScreen}
        options={{
          title: 'Sales Reports',
        }}
      />

      <Stack.Screen
        name="CustomerReports"
        component={CustomerReportsScreen}
        options={{
          title: 'Customer Reports',
        }}
      />

      <Stack.Screen
        name="ProductReports"
        component={ProductReportsScreen}
        options={{
          title: 'Product Reports',
        }}
      /> */}

      {/* <Stack.Screen
        name="DeliveryReports"
        component={DeliveryReportsScreen}
        options={{
          title: 'Delivery Reports',
        }}
      /> */}

      {/* Settings Screens */}
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          title: 'Admin Profile',
        }}
      />

      <Stack.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          title: 'Admin Settings',
        }}
      />

      <Stack.Screen
        name="AdminSecurity"
        component={AdminSecurityScreen}
        options={{
          title: 'Security Dashboard',
        }}
      />

      <Stack.Screen
        name="AdminTwoFactor"
        component={AdminTwoFactorScreen}
        options={{
          title: 'Two-Factor Authentication',
        }}
      />

      <Stack.Screen
        name="AdminUserManagement"
        component={AdminUserManagementScreen}
        options={{
          title: 'Admin User Management',
        }}
      />
    </Stack.Navigator>
  );
};

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menu: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default AdminNavigator;
