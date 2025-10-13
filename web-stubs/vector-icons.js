// web-stubs/vector-icons.js
import React from 'react';
import { Text } from 'react-native';

// Icon name mapping for better web display
const iconMap = {
  'home': '🏠',
  'shopping-cart': '🛒',
  'receipt': '📄',
  'person': '👤',
  'notifications-none': '🔔',
  'location-on': '📍',
  'search': '🔍',
  'tune': '⚙️',
  'logout': '🚪',
  'login': '🔑',
};

const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const iconText = iconMap[name] || name || '●';
  
  return React.createElement(Text, {
    style: [
      {
        fontSize: size,
        color: color,
        fontFamily: 'system',
      },
      style
    ],
    ...props
  }, iconText);
};

export default Icon;

// Named exports for common icon sets
export { Icon };

// MaterialIcons specific export
export const MaterialIcons = Icon;
