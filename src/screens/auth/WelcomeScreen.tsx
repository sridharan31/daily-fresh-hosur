// app/screens/auth/WelcomeScreen.tsx - Simplified Web-Safe Version
import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { AuthNavigationProp } from '../../navigation/navigationTypes';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSignIn = () => {
    navigation.navigate('Login', {});
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>🥬</div>
          <div style={styles.appName}>FreshCart</div>
          <div style={styles.tagline}>Fresh groceries at your doorstep</div>
        </div>

        <div style={styles.buttonsContainer}>
          <button
            onClick={handleGetStarted}
            style={styles.primaryButton}
          >
            Get Started
          </button>
          
          <button
            onClick={handleSignIn}
            style={styles.secondaryButton}
          >
            Already have an account? Sign In
          </button>

          <div style={styles.featuresContainer}>
            <div style={styles.featureText}>✨ Fresh & Organic Products</div>
            <div style={styles.featureText}>🚚 Same Day Delivery</div>
            <div style={styles.featureText}>💰 Best Prices Guaranteed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
  },
  overlay: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: '50px 30px',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '50px',
  },
  logo: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  appName: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  tagline: {
    fontSize: '16px',
    color: '#fff',
    textAlign: 'center' as const,
    opacity: 0.9,
  },
  buttonsContainer: {
    marginBottom: '30px',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '25px',
    cursor: 'pointer',
    marginBottom: '15px',
    width: '100%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '25px',
    cursor: 'pointer',
    width: '100%',
  },
  featuresContainer: {
    marginTop: '30px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  featureText: {
    color: '#fff',
    fontSize: '14px',
    margin: '4px 0',
    opacity: 0.9,
  },
};

export default WelcomeScreen;
