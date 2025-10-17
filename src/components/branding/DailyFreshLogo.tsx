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
  if (variant === 'icon') {
    return (
      <View style={{
        width: width,
        height: height,
        backgroundColor: '#4CAF50',
        borderRadius: width / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <View style={{
          width: width * 0.6,
          height: width * 0.6,
          backgroundColor: '#FFFFFF',
          borderRadius: (width * 0.6) / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: width * 0.3,
            height: width * 0.3,
            backgroundColor: '#4CAF50',
            borderRadius: (width * 0.3) / 2,
          }} />
        </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          marginRight: showText ? 12 : 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 20,
            height: 20,
            backgroundColor: '#4CAF50',
            borderRadius: 10,
          }} />
        </View>
      </View>
    </View>
  );
};

export default DailyFreshLogo;