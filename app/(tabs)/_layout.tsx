import { Tabs, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { DailyFreshLogo } from '../../src/components/branding/DailyFreshLogo';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/hooks/useTheme';



// Custom Header Component
const CustomHeader = ({ title, showSearch = false, showCart = true, onFilterPress }: { 
  title: string; 
  showSearch?: boolean; 
  showCart?: boolean;
  onFilterPress?: () => void;
}) => {
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const cart = useSelector((state: any) => state.cart?.items || []);
  const cartItemCount = Array.isArray(cart) ? cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 0;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleNotifications = () => {
    console.log('Notifications pressed');
    // Navigate to notifications screen
    router.push('/notifications');
  };

  const handleCart = () => {
    console.log('Cart pressed');
    router.push('/(tabs)/cart');
  };

  const handleProfile = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogin = () => {
    setShowProfileDropdown(false);
    router.push('/');
  };

  const { signOut } = useAuth();

  const handleLogout = () => {
    setShowProfileDropdown(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            // Dispatch logout action which clears state and persisted data
            try {
              await signOut();
            } catch (e) {
              console.warn('Logout failed locally:', e);
            }
            // Navigate to login screen
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleMyProfile = () => {
    setShowProfileDropdown(false);
    router.push('/(tabs)/profile');
  };

  const handleMyOrders = () => {
    setShowProfileDropdown(false);
    router.push('/(tabs)/orders');
  };

  const handleThemeToggle = () => {
    setShowProfileDropdown(false);
    if (toggleTheme) {
      toggleTheme();
    }
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.header}>
        {/* Left Section */}
        <View style={styles.headerLeft}>
          <View style={styles.locationSection}>
            <Icon name="location-on" size={16} color={colors.primary} />
            <View>
              <Text style={styles.deliverToText}>Deliver to</Text>
              <Text style={styles.locationText}>New York, NY</Text>
            </View>
          </View>
        </View>

        {/* Center Section */}
        <View style={styles.headerCenter}>
          {title === "Daily Fresh Hosur" ? (
            <DailyFreshLogo width={140} height={50} variant="full" />
          ) : (
            <Text style={styles.headerTitle}>{title}</Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleNotifications}>
            <Icon name="notifications-none" size={24} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {showCart && (
            <TouchableOpacity style={styles.headerButton} onPress={handleCart}>
              <Icon name="shopping-cart" size={24} color={colors.text} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.profileContainer}>
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={handleProfile}
            >
              <Text style={styles.profileInitial}>
                {user?.firstName?.charAt(0) || 'G'}
              </Text>
            </TouchableOpacity>
            
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <View style={styles.dropdown}>
                <View style={styles.dropdownContent}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={handleMyProfile}>
                    <Icon name="person" size={20} color={colors.text} />
                    <Text style={styles.dropdownText}>My Profile</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.dropdownItem} onPress={handleMyOrders}>
                    <Icon name="receipt" size={20} color={colors.text} />
                    <Text style={styles.dropdownText}>My Orders</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.dropdownItem} onPress={handleThemeToggle}>
                    <Icon name={isDark ? "light-mode" : "dark-mode"} size={20} color={colors.text} />
                    <Text style={styles.dropdownText}>
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.dropdownDivider} />
                  
                  {user ? (
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                      <Icon name="logout" size={20} color={colors.error} />
                      <Text style={[styles.dropdownText, { color: colors.error }]}>Logout</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleLogin}>
                      <Icon name="login" size={20} color={colors.primary} />
                      <Text style={[styles.dropdownText, { color: colors.primary }]}>Login</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar}>
            <Icon name="search" size={20} color={colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search for fresh produce...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Icon name="tune" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Overlay to close dropdown */}
      {showProfileDropdown && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setShowProfileDropdown(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default function TabLayout() {
  const { colors } = useTheme();
  
  // Create a filter handler for the home screen
  const handleHomeFilter = () => {
    console.log('Filter button pressed on home screen');
    // This will be picked up by the home screen component
    // We can use a global state or event system for this, but for now
    // let's create a simple solution by storing filter state globally
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openHomeFilters'));
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          header: () => <CustomHeader title="Daily Fresh Hosur" showSearch={true} showCart={true} onFilterPress={handleHomeFilter} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-cart" size={size} color={color} />
          ),
          header: () => <CustomHeader title="Shopping Cart" showCart={false} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',  
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt" size={size} color={color} />
          ),
          header: () => <CustomHeader title="My Orders" showCart={true} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
          header: () => <CustomHeader title="My Profile" showCart={true} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  headerLeft: {
    flex: 1,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliverToText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  profileInitial: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textTertiary,
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
      },
    }),
  },
  dropdownContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
});