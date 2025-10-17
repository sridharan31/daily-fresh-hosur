import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface NativeWindProviderProps {
  children: React.ReactNode;
}

export const NativeWindProvider: React.FC<NativeWindProviderProps> = ({ children }) => {
  useEffect(() => {
    // NativeWind CSS is loaded globally in App.tsx at line 13
    // This provider just logs initialization status for debugging
    if (Platform.OS === 'web') {
      console.log('✅ NativeWind initialized for web');
    } else {
      console.log('✅ NativeWind initialized for native');
    }
  }, []);

  return <>{children}</>;
};

export default NativeWindProvider;