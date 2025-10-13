import { router } from 'expo-router';
// Import global CSS for web platform
if (typeof window !== 'undefined') {
  require('../global.css');
  require('../src/styles/global.web.js');
}

import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';

import { RootState } from '../lib/store';
import { SimpleLoginScreen } from '../src/components/auth/SimpleLoginScreen';
import { SimpleRegisterScreen } from '../src/components/auth/SimpleRegisterScreen';
import { DailyFreshLogo } from '../src/components/branding/DailyFreshLogo';

const { width } = Dimensions.get('window');

type ScreenType = 'onboarding' | 'login' | 'register';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  icon: string;
  color: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Fresh from Hosur Farms',
    description: 'Get fresh organic groceries sourced directly from local Hosur farms, delivered to your doorstep with quality guaranteed.',
    image: require('../assets/images/onboarding-1.png'),
    icon: 'shopping-bag',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: 'Same Day Delivery in Hosur',
    description: 'Lightning fast delivery across Hosur. Order before 2 PM and get fresh groceries delivered by evening.',
    image: require('../assets/images/onboarding-2.png'),
    icon: 'truck',
    color: '#2196F3',
  },
  {
    id: '3',
    title: 'Daily Fresh Prices',
    description: 'Best prices guaranteed on all your favorite items. Fresh groceries, honest prices, delivered daily.',
    image: require('../assets/images/onboarding-3.png'),
    icon: 'tag',
    color: '#FF9800',
  },
];

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    // Check user role and redirect accordingly
    if (user?.role === 'admin') {
      console.log('🔑 Admin user detected, redirecting to admin dashboard');
      router.replace('/admin');
    } else {
      // Regular customer user
      console.log('👤 Customer user detected, redirecting to customer home');
      router.replace('/(tabs)/home');
    }
  };

  const handleGuestAccess = () => {
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentScreen('login');
    }
  };

  const handleSkip = () => {
    setCurrentScreen('login');
  };

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <SimpleLoginScreen 
        onLoginSuccess={handleLogin}
        onRegisterPress={() => setCurrentScreen('register')}
        onGuestPress={handleGuestAccess}
        showGuestOption={true}
        showBackToOnboarding={true}
        onBackPress={() => setCurrentScreen('onboarding')}
      />
    );
  }

  // Registration Screen
  if (currentScreen === 'register') {
    return (
      <SimpleRegisterScreen 
        onRegisterSuccess={handleLogin}
        onLoginPress={() => setCurrentScreen('login')}
        showBackToLogin={true}
        onBackPress={() => setCurrentScreen('login')}
      />
    );
  }

  // Onboarding Screen
  const currentItem = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header with Logo and Skip */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <DailyFreshLogo width={160} height={60} variant="full" />
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={currentItem.image} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentItem.title}</Text>
          <Text style={styles.description}>{currentItem.description}</Text>
        </View>
      </View>

      {/* Navigation Indicators */}
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: currentItem.color }]}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Icon name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCurrentScreen('login')}
          style={styles.signInButton}
        >
          <Text style={[styles.signInButtonText, { color: currentItem.color }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    width: 20,
  },
  inactiveIndicator: {
    backgroundColor: '#ddd',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 15,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  signInButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
