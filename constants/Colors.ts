/**
 * Grocery Delivery App Color Theme System
 * Comprehensive color palette for light and dark modes with semantic color names
 */

// Primary Brand Colors
const primaryGreen = '#4CAF50';
const primaryGreenDark = '#2E7D32';
const primaryGreenLight = '#81C784';

// Secondary Colors
const accentOrange = '#FF9800';
const accentRed = '#F44336';
const accentBlue = '#2196F3';

// Neutral Colors
const textPrimary = '#212121';
const textSecondary = '#757575';
const textTertiary = '#9E9E9E';
const backgroundPrimary = '#FFFFFF';
const backgroundSecondary = '#F5F5F5';
const backgroundTertiary = '#EEEEEE';

// Dark Mode Colors
const darkTextPrimary = '#FFFFFF';
const darkTextSecondary = '#B3B3B3';
const darkTextTertiary = '#808080';
const darkBackgroundPrimary = '#121212';
const darkBackgroundSecondary = '#1E1E1E';
const darkBackgroundTertiary = '#2C2C2C';

export const Colors = {
  light: {
    // Text Colors
    text: textPrimary,
    textSecondary: textSecondary,
    textTertiary: textTertiary,
    textInverse: backgroundPrimary,
    
    // Background Colors
    background: backgroundPrimary,
    backgroundSecondary: backgroundSecondary,
    backgroundTertiary: backgroundTertiary,
    
    // Brand Colors
    primary: primaryGreen,
    primaryDark: primaryGreenDark,
    primaryLight: primaryGreenLight,
    
    // Accent Colors
    accent: accentOrange,
    success: primaryGreen,
    warning: accentOrange,
    error: accentRed,
    info: accentBlue,
    
    // Component Colors
    card: backgroundPrimary,
    cardBorder: '#E0E0E0',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    
    // Interactive Colors
    tint: primaryGreen,
    link: accentBlue,
    placeholder: textTertiary,
    
    // Tab Colors
    tabIconDefault: textTertiary,
    tabIconSelected: primaryGreen,
    tabBackground: backgroundPrimary,
    
    // Icon Colors
    icon: textSecondary,
    iconPrimary: primaryGreen,
    iconSecondary: textTertiary,
    
    // Status Colors
    online: primaryGreen,
    offline: textTertiary,
    pending: accentOrange,
    
    // Shadow
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
  },
  dark: {
    // Text Colors
    text: darkTextPrimary,
    textSecondary: darkTextSecondary,
    textTertiary: darkTextTertiary,
    textInverse: darkBackgroundPrimary,
    
    // Background Colors
    background: darkBackgroundPrimary,
    backgroundSecondary: darkBackgroundSecondary,
    backgroundTertiary: darkBackgroundTertiary,
    
    // Brand Colors
    primary: primaryGreenLight,
    primaryDark: primaryGreen,
    primaryLight: '#A5D6A7',
    
    // Accent Colors
    accent: '#FFB74D',
    success: primaryGreenLight,
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Component Colors
    card: darkBackgroundSecondary,
    cardBorder: '#404040',
    border: '#404040',
    borderLight: '#303030',
    
    // Interactive Colors
    tint: primaryGreenLight,
    link: '#42A5F5',
    placeholder: darkTextTertiary,
    
    // Tab Colors
    tabIconDefault: darkTextTertiary,
    tabIconSelected: primaryGreenLight,
    tabBackground: darkBackgroundPrimary,
    
    // Icon Colors
    icon: darkTextSecondary,
    iconPrimary: primaryGreenLight,
    iconSecondary: darkTextTertiary,
    
    // Status Colors
    online: primaryGreenLight,
    offline: darkTextTertiary,
    pending: '#FFB74D',
    
    // Shadow
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
  },
};

// Theme Helper Functions
export const getThemeColors = (isDark: boolean = false) => {
  return isDark ? Colors.dark : Colors.light;
};

// Semantic Color Mappings for specific use cases
export const SemanticColors = {
  // Product related
  productPrice: Colors.light.primary,
  productDiscount: Colors.light.error,
  productRating: '#FFC107',
  productOutOfStock: Colors.light.textTertiary,
  
  // Order status
  orderPending: Colors.light.warning,
  orderConfirmed: Colors.light.info,
  orderDelivered: Colors.light.success,
  orderCancelled: Colors.light.error,
  
  // Category colors
  categoryFresh: '#4CAF50',
  categoryDairy: '#2196F3',
  categoryMeat: '#F44336',
  categoryBakery: '#FF9800',
  categoryBeverage: '#9C27B0',
  categorySnacks: '#795548',
  
  // Quick action colors
  quickActionBackground: Colors.light.backgroundSecondary,
  quickActionBorder: Colors.light.borderLight,
  quickActionIcon: Colors.light.primary,
};
