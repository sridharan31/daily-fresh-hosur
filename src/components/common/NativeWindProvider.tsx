import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface NativeWindProviderProps {
  children: React.ReactNode;
}

export const NativeWindProvider: React.FC<NativeWindProviderProps> = ({ children }) => {
  useEffect(() => {
    // Ensure global CSS is loaded for web
    if (Platform.OS === 'web') {
      try {
        // Use require for CSS import on web
        require('../../../global.css');
      } catch (error) {
        console.warn('Could not load global.css:', error);
      }
    }
  }, []);

  return <>{children}</>;
};

export default NativeWindProvider;