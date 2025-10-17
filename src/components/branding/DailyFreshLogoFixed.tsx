import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      <View style={[
        styles.iconContainer,
        { width: width, height: height }
      ]}>
        <View style={[
          styles.iconInner,
          { 
            width: width * 0.6, 
            height: width * 0.6,
            borderRadius: (width * 0.6) / 2 
          }
        ]}>
          <View style={[
            styles.iconDot,
            { 
              width: width * 0.3, 
              height: width * 0.3,
              borderRadius: (width * 0.3) / 2 
            }
          ]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { width: width, height: height }
    ]}>
      <View style={styles.logoContent}>
        <View style={styles.logoIcon}>
          <View style={styles.iconDot} />
        </View>
        {showText && (
          <Text style={styles.logoText}>Daily Fresh</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContent: {
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
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  iconContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconInner: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DailyFreshLogo;