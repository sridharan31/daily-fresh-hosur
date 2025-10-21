// import React from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
// import { AdminTabParamList } from '../../navigation/AdminNavigator';

// type AdminTabNavigationProp = BottomTabNavigationProp<AdminTabParamList>;

// const AdminNavigationScreen: React.FC = () => {
//   const navigation = useNavigation<AdminTabNavigationProp>();

//   const menuItems = [
//     {
//       id: 'dashboard',
//       title: 'Dashboard Overview',
//       icon: 'dashboard',
//       description: 'View sales, orders, and key metrics',
//       route: () => navigation.navigate('Dashboard')
//     },
//     {
//       id: 'products',
//       title: 'Product Management',
//       icon: 'inventory',
//       description: 'Manage products, categories, and inventory',
//       route: () => navigation.navigate('Products')
//     },
//     {
//       id: 'orders',
//       title: 'Order Management',
//       icon: 'receipt-long',
//       description: 'Track and manage customer orders',
//       route: () => navigation.navigate('Orders')
//     },
//     {
//       id: 'customers',
//       title: 'Customer Management',
//       icon: 'people',
//       description: 'View and manage customer accounts',
//       route: () => navigation.navigate('Customers')
//     },
//     {
//       id: 'users',
//       title: 'User Management',
//       icon: 'admin-panel-settings',
//       description: 'Manage staff and admin accounts',
//       route: () => navigation.navigate('Users')
//     },
//     {
//       id: 'slots',
//       title: 'Delivery Slots',
//       icon: 'schedule',
//       description: 'Configure delivery time slots',
//       route: () => navigation.navigate('Slots')
//     },
//     {
//       id: 'reports',
//       title: 'Advanced Reports',
//       icon: 'analytics',
//       description: 'View detailed sales and performance reports',
//       route: () => {
//         // This requires special handling as it's in the drawer navigator
//         // navigation.getParent()?.navigate('Reports');
//         navigation.navigate('Dashboard'); // Fallback
//       }
//     },
//     {
//       id: 'settings',
//       title: 'System Settings',
//       icon: 'settings',
//       description: 'Configure application settings',
//       route: () => {
//         // This requires special handling as it's in the drawer navigator
//         // navigation.getParent()?.navigate('Settings');
//         navigation.navigate('Dashboard'); // Fallback
//       }
//     }
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Admin Dashboard</Text>
//         <Text style={styles.headerSubtitle}>Welcome to Daily Fresh Hosur Admin Panel</Text>
//       </View>

//       <View style={styles.statsContainer}>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>₹24,500</Text>
//           <Text style={styles.statLabel}>Today's Sales</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>37</Text>
//           <Text style={styles.statLabel}>New Orders</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>12</Text>
//           <Text style={styles.statLabel}>Low Stock</Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Quick Actions</Text>

//       <View style={styles.menuGrid}>
//         {menuItems.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.menuItem}
//             onPress={item.route}
//           >
//             <Icon name={item.icon} size={32} color="#4CAF50" style={styles.menuIcon} />
//             <View style={styles.menuTextContainer}>
//               <Text style={styles.menuTitle}>{item.title}</Text>
//               <Text style={styles.menuDescription}>{item.description}</Text>
//             </View>
//             <Icon name="chevron-right" size={24} color="#ccc" />
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 16,
//   },
//   header: {
//     marginBottom: 24,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#666',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 16,
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   menuGrid: {
//     flexDirection: 'column',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   menuIcon: {
//     marginRight: 16,
//   },
//   menuTextContainer: {
//     flex: 1,
//   },
//   menuTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   menuDescription: {
//     fontSize: 13,
//     color: '#666',
//   },
// });

// export default AdminNavigationScreen;