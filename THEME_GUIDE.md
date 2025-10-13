# Theme System Usage Guide

## Overview
The grocery delivery app now includes a comprehensive theme system with support for light and dark modes.

## Quick Start

### 1. Import the theme hook
```typescript
import { useTheme } from '../hooks/useTheme';
```

### 2. Use in component
```typescript
export default function MyComponent() {
  const { colors, isDark, cardStyle, textStyles } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={[cardStyle, { padding: 16 }]}>
      <Text style={textStyles.primary}>Hello World</Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
});
```

## Available Colors

### Light Mode
- **Background**: `colors.background` - Primary background (#FFFFFF)
- **Text**: `colors.text` - Primary text (#212121)
- **Primary**: `colors.primary` - Brand green (#4CAF50)
- **Card**: `colors.card` - Card background (#FFFFFF)
- **Border**: `colors.border` - Border color (#E0E0E0)

### Dark Mode
- **Background**: `colors.background` - Primary background (#121212)
- **Text**: `colors.text` - Primary text (#FFFFFF)
- **Primary**: `colors.primary` - Brand green light (#81C784)
- **Card**: `colors.card` - Card background (#1E1E1E)
- **Border**: `colors.border` - Border color (#404040)

## Semantic Colors

### Status Colors
- `colors.success` - Success states
- `colors.warning` - Warning states  
- `colors.error` - Error states
- `colors.info` - Information states

### Interactive Colors
- `colors.link` - Links and interactive text
- `colors.tint` - Tint color for active states
- `colors.placeholder` - Placeholder text

## Pre-built Styles

### Card Style
```typescript
const { cardStyle } = useTheme();
// Returns: { backgroundColor, borderColor, shadowColor }
```

### Text Styles
```typescript
const { textStyles } = useTheme();
// textStyles.primary - Primary text color
// textStyles.secondary - Secondary text color
// textStyles.tertiary - Tertiary text color
// textStyles.inverse - Inverse text color
```

### Button Styles
```typescript
const { buttonStyles } = useTheme();
// buttonStyles.primary - Primary button
// buttonStyles.secondary - Secondary button
// buttonStyles.outline - Outline button
```

## Category Colors (SemanticColors)
```typescript
import { SemanticColors } from '../../constants/Colors';

// Product categories
SemanticColors.categoryFresh    // #4CAF50
SemanticColors.categoryDairy    // #2196F3
SemanticColors.categoryMeat     // #F44336
SemanticColors.categoryBakery   // #FF9800
```

## Best Practices

1. **Always use theme colors** instead of hardcoded hex values
2. **Create dynamic styles** using the `createStyles` pattern
3. **Test both light and dark modes** in your components
4. **Use semantic colors** for consistent meaning across the app
5. **Leverage pre-built styles** for common patterns

## Migration Guide

### Before (Static Colors)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#333333',
  },
});
```

### After (Theme Colors)
```typescript
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
});

// In component
const { colors } = useTheme();
const styles = createStyles(colors);
```

## Theme Toggle

### Manual Theme Control
The app now supports manual theme switching with persistent storage:

```typescript
import { useTheme } from '../hooks/useTheme';

const { colors, isDark, themeMode, setThemeMode, toggleTheme } = useTheme();

// Toggle between light and dark mode
const handleToggle = () => {
  toggleTheme(); // Switches between 'light' and 'dark'
};

// Set specific theme mode
const handleSetMode = (mode: 'light' | 'dark' | 'system') => {
  setThemeMode(mode);
};

// Check current theme state
console.log('Current theme mode:', themeMode); // 'light', 'dark', or 'system'
console.log('Is dark mode active:', isDark); // boolean
```

### Theme Modes
- **Light Mode**: `setThemeMode('light')` - Forces light theme
- **Dark Mode**: `setThemeMode('dark')` - Forces dark theme  
- **System Mode**: `setThemeMode('system')` - Follows device preference (default)

### Implementation
The theme toggle is implemented in the profile dropdown menu in the tab navigation for optimal UX accessibility. Users can easily switch themes without navigating to a separate settings screen.