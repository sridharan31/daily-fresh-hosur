import React from 'react';
import { Image, StyleSheet, View } from '../ui/WebCompatibleComponents';

interface DailyFreshLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const DailyFreshLogo: React.FC<DailyFreshLogoProps> = ({
  width = 200,
  height = 80,
  showText = true,
  variant = 'full'
}) => {
  const logoSource = require('../../../assets/branding/Fresh_From_Hosur_Farms.svg');

  if (variant === 'icon') {
    // For icon variant, show a square/circular version
    const iconSize = Math.min(width, height);
    return (
      <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
        <Image
          source={logoSource}
          style={{
            width: iconSize,
            height: iconSize,
            resizeMode: 'contain',
          }}
          accessibilityLabel="Fresh From Hosur Farms Logo"
        />
      </View>
    );
  }

  // Full variant
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={logoSource}
        style={{
          width: width,
          height: height,
          resizeMode: 'contain',
        }}
        accessibilityLabel="Fresh From Hosur Farms Logo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default DailyFreshLogo;