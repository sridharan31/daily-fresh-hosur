import { useColorScheme } from 'react-native';
import { Colors, getThemeColors, SemanticColors } from '../../constants/Colors';
import { useThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook for accessing theme colors based on the current color scheme
 * Automatically switches between light and dark theme colors
 * Uses ThemeContext if available for manual theme control, falls back to system theme
 */
export function useTheme() {
  // Try to use ThemeContext first (for manual theme control)
  try {
    const themeContext = useThemeContext();
    if (themeContext) {
      return themeContext;
    }
  } catch {
    // ThemeContext not available, fall back to system theme
  }

  // Fallback to system color scheme (backward compatibility)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getThemeColors(isDark);

  return {
    colors,
    isDark,
    semantic: SemanticColors,
    themeMode: 'system' as const,
    setThemeMode: () => {}, // No-op for backward compatibility
    toggleTheme: () => {}, // No-op for backward compatibility
    // Helper functions for common styling patterns
    cardStyle: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
    },
    headerStyle: {
      backgroundColor: colors.background,
      borderColor: colors.borderLight,
    },
    textStyles: {
      primary: { color: colors.text },
      secondary: { color: colors.textSecondary },
      tertiary: { color: colors.textTertiary },
      inverse: { color: colors.textInverse },
    },
    buttonStyles: {
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
    },
  };
}

/**
 * Get specific color from theme
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

/**
 * Theme-aware styling helper
 */
export function createThemedStyles<T>(
  styleCreator: (colors: typeof Colors.light, isDark: boolean) => T
) {
  return (colorScheme?: 'light' | 'dark') => {
    const isDark = colorScheme === 'dark';
    const colors = getThemeColors(isDark);
    return styleCreator(colors, isDark);
  };
}

// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
