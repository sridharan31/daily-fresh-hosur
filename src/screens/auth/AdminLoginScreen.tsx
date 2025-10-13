import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthStackParamList } from '../../../lib/types/navigation';
import { validateEmail } from '../../../lib/utils/validators';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

type AdminLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface AdminLoginScreenProps {
  onLoginSuccess?: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess }) => {
  const navigation = useNavigation<AdminLoginScreenNavigationProp>();
  const { login, isLoading, error } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  
  // Notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const fadeAnim = new Animated.Value(0);

  // Admin-specific security: Account lockout after failed attempts
  useEffect(() => {
    if (loginAttempts >= 3) {
      setIsLocked(true);
      setLockTimeLeft(300); // 5 minutes lockout
      
      const timer = setInterval(() => {
        setLockTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loginAttempts]);

  // Helper functions for notifications
  const showSuccessMessage = (message: string) => {
    setNotificationMessage(message);
    setShowSuccessNotification(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessNotification(false);
      });
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    setNotificationMessage(message);
    setShowErrorNotification(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowErrorNotification(false);
      });
    }, 3000);
  };

  // Enhanced validation for admin accounts
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      isValid = false;
    } else {
      setEmailError('');
    }

    // Enhanced password validation for admin
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Admin password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Admin-specific email domain validation (optional)
    if (email && !email.includes('@') || (!email.endsWith('.com') && !email.endsWith('.org'))) {
      setEmailError('Please use a valid admin email address');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (isLocked) {
      showErrorMessage(`Account locked. Try again in ${Math.ceil(lockTimeLeft / 60)} minutes.`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await login({ email, password });
      
      // The auth hook will handle role-based navigation
      // If we reach here, login was successful
      showSuccessMessage('Admin login successful!');

      showSuccessMessage('Admin login successful!');
      setLoginAttempts(0); // Reset attempts on successful login
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      showErrorMessage(
        error || 'Invalid admin credentials. Please try again.'
      );
    }
  };

  const handleBackToCustomerLogin = () => {
    navigation.navigate('Login');
  };

  const formatLockTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <LoadingScreen message="Verifying admin credentials..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="admin-panel-settings" size={60} color="#007AFF" />
            </View>
            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.subtitle}>
              Secure access for administrators only
            </Text>
            {loginAttempts > 0 && (
              <Text style={styles.attemptsWarning}>
                {isLocked 
                  ? `Account locked for ${formatLockTime(lockTimeLeft)}`
                  : `${loginAttempts}/3 failed attempts`
                }
              </Text>
            )}
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <View style={styles.form}>
              <Input
                label="Admin Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your admin email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={emailError}
                leftIcon="email"
                editable={!isLocked}
              />

              <Input
                label="Admin Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your admin password"
                secureTextEntry={!showPassword}
                error={passwordError}
                leftIcon="lock"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!isLocked}
              />

              <Button
                title={isLocked ? `Locked (${formatLockTime(lockTimeLeft)})` : "Sign In to Admin Panel"}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLocked}
                style={styles.loginButton}
              />
            </View>
          </Card>

          {/* Security Notice */}
          <Card style={styles.securityCard}>
            <View style={styles.securityNotice}>
              <Icon name="security" size={24} color="#ff9800" />
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Security Notice</Text>
                <Text style={styles.securityMessage}>
                  This is a secure admin portal. All access attempts are logged and monitored.
                </Text>
              </View>
            </View>
          </Card>

          {/* Back to Customer Login */}
          <TouchableOpacity
            style={styles.backToCustomer}
            onPress={handleBackToCustomerLogin}
          >
            <Icon name="arrow-back" size={20} color="#666" />
            <Text style={styles.backToCustomerText}>Back to Customer Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Notification */}
      {showSuccessNotification && (
        <Animated.View style={[styles.notification, styles.successNotification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>{notificationMessage}</Text>
        </Animated.View>
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <Animated.View style={[styles.notification, styles.errorNotification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>{notificationMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: '#007AFF',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 10,
    },
    attemptsWarning: {
      fontSize: 14,
      color: '#dc3545',
      textAlign: 'center',
      fontWeight: '600',
      backgroundColor: '#fff5f5',
      padding: 8,
      borderRadius: 6,
      marginTop: 10,
    },
    formCard: {
      marginBottom: 20,
    },
    form: {
      padding: 24,
    },
    loginButton: {
      marginTop: 20,
    },
    securityCard: {
      marginBottom: 20,
      backgroundColor: '#fff8e1',
      borderLeftWidth: 4,
      borderLeftColor: '#ff9800',
    },
    securityNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
    },
    securityText: {
      flex: 1,
      marginLeft: 12,
    },
    securityTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#e65100',
      marginBottom: 4,
    },
    securityMessage: {
      fontSize: 14,
      color: '#bf360c',
      lineHeight: 20,
    },
    backToCustomer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      padding: 12,
    },
    backToCustomerText: {
      fontSize: 16,
      color: '#666',
      marginLeft: 8,
    },
    // Notification styles
    notification: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      padding: 16,
      borderRadius: 8,
      zIndex: 1000,
    },
    successNotification: {
      backgroundColor: '#4CAF50',
    },
    errorNotification: {
      backgroundColor: '#f44336',
    },
    notificationText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

export default AdminLoginScreen;