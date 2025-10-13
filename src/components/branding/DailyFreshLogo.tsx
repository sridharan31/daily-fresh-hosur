import React from 'react';
import { View } from 'react-native';

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
  // For web platform, we'll use the SVG assets directly in img tags
  if (typeof window !== 'undefined') {
    if (variant === 'icon') {
      return (
        <View style={{
          width: width,
          height: height,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src="/assets/branding/daily-fresh-icon.svg"
            alt="Daily Fresh Logo"
            style={{
              width: width,
              height: height,
              objectFit: 'contain'
            }}
          />
        </View>
      );
    }

    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
      }}>
        <img 
          src="/assets/?unstable_path=.%2Fassets%2Fbranding/daily-fresh-logo.svg"
          alt="Daily Fresh Hosur"
          style={{
            width: width,
            height: height,
            objectFit: 'contain'
          }}
        />
      </View>
    );
  }

  // For mobile platforms, fallback to simple icon design
  if (variant === 'icon') {
    return (
      <View style={{
        width: width,
        height: height,
        backgroundColor: '#4CAF50',
        borderRadius: width / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: width * 0.4,
          height: width * 0.4,
          backgroundColor: '#FFFFFF',
          borderRadius: (width * 0.4) / 2,
        }} />
      </View>
    );
  }

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: width,
      height: height,
    }}>
      <View style={{
        width: Math.min(width, height) * 0.8,
        height: Math.min(width, height) * 0.8,
        backgroundColor: '#4CAF50',
        borderRadius: (Math.min(width, height) * 0.8) / 2,
      }} />
    </View>
  );
};

export default DailyFreshLogo;