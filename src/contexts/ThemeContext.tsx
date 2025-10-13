// Platform-safe AsyncStorage import
let AsyncStorage: any;

if (typeof window !== 'undefined') {
  // Web environment - use localStorage wrapper
  AsyncStorage = {
    getItem: async (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors on web
      }
    },
    removeItem: async (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors on web
      }
    },
  };
} else {
  // Native environment
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    // Fallback if import fails
    AsyncStorage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
}

// Web-compatible useColorScheme hook
const useColorScheme = () => {
  if (typeof window !== 'undefined') {
    // Web environment - use media query
    const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
    
    React.useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setColorScheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);
    
    return colorScheme;
  } else {
    // Native environment - use React Native's hook
    try {
      const { useColorScheme: rnUseColorScheme } = require('react-native');
      return rnUseColorScheme();
    } catch {
      return 'light';
    }
  }
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Colors, getThemeColors, SemanticColors } from '../../constants/Colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // Current theme state
  colors: typeof Colors.light;
  isDark: boolean;
  themeMode: ThemeMode;
  
  // Theme controls
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Semantic colors
  semantic: typeof SemanticColors;
  
  // Helper styles (same as useTheme hook)
  cardStyle: {
    backgroundColor: string;
    borderColor: string;
    shadowColor: string;
  };
  headerStyle: {
    backgroundColor: string;
    borderColor: string;
  };
  textStyles: {
    primary: { color: string };
    secondary: { color: string };
    tertiary: { color: string };
    inverse: { color: string };
  };
  buttonStyles: {
    primary: {
      backgroundColor: string;
      color: string;
    };
    secondary: {
      backgroundColor: string;
      color: string;
      borderColor: string;
    };
    outline: {
      backgroundColor: string;
      color: string;
      borderColor: string;
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@grocery_app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate actual theme based on mode and system preference
  const getActualTheme = (mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  const actualTheme = getActualTheme(themeMode, systemColorScheme);
  const isDark = actualTheme === 'dark';
  const colors = getThemeColors(isDark);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Toggle between light and dark (not system)
  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Helper styles (same as useTheme hook)
  const cardStyle = {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
  };

  const headerStyle = {
    backgroundColor: colors.background,
    borderColor: colors.borderLight,
  };

  const textStyles = {
    primary: { color: colors.text },
    secondary: { color: colors.textSecondary },
    tertiary: { color: colors.textTertiary },
    inverse: { color: colors.textInverse },
  };

  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textInverse,
    },
    secondary: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      borderColor: colors.primary,
    },
  };

  const contextValue: ThemeContextType = {
    colors,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    semantic: SemanticColors,
    cardStyle,
    headerStyle,
    textStyles,
    buttonStyles,
  };

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Default export for Expo Router compatibility
export default ThemeProvider;