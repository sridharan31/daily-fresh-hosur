import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { validateEmail, validatePassword, validators } from '../../../lib/utils/validators';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isLoading, error, updateProfile, changePassword, signOut } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fadeAnim = new Animated.Value(0);

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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updatePasswordData = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate first name
    const firstNameValidation = validators.validateName(formData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.errors[0] || 'Invalid first name';
      isValid = false;
    } else {
      newErrors.firstName = '';
    }

    // Validate last name
    const lastNameValidation = validators.validateName(formData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.errors[0] || 'Invalid last name';
      isValid = false;
    } else {
      newErrors.lastName = '';
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate phone
    const phoneValidation = validators.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.errors[0] || 'Invalid phone number';
      isValid = false;
    } else {
      newErrors.phone = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePasswordForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate current password
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    } else {
      newErrors.currentPassword = '';
    }

    // Validate new password
    const passwordError = validatePassword(passwordData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
      isValid = false;
    } else {
      newErrors.newPassword = '';
    }

    // Validate confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    } else {
      newErrors.confirmPassword = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });
      showSuccessMessage('Profile updated successfully!');
    } catch (err) {
      showErrorMessage(
        error || 'Failed to update profile. Please try again.'
      );
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowChangePassword(false);
    } catch (err) {
      showErrorMessage(
        error || 'Failed to change password. Please try again.'
      );
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      showSuccessMessage('You have been logged out successfully.');
      // Navigate to login screen after logout
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout error:', error);
      showErrorMessage('Logout failed. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Updating profile..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your account information</Text>
        </View>

        {/* Profile Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                autoCapitalize="words"
                error={errors.firstName}
              />
            </View>
            <View style={styles.nameInput}>
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                autoCapitalize="words"
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon="mail"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon="phone"
          />

          <Button
            title="Update Profile"
            onPress={handleUpdateProfile}
            loading={isLoading}
            style={styles.updateButton}
          />
        </Card>

        {/* Password Section */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.toggleIcon}>
              {showChangePassword ? '−' : '+'}
            </Text>
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.passwordSection}>
              <Input
                label="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(value) => updatePasswordData('currentPassword', value)}
                placeholder="Enter current password"
                secureTextEntry
                error={errors.currentPassword}
                leftIcon="lock"
              />

              <Input
                label="New Password"
                value={passwordData.newPassword}
                onChangeText={(value) => updatePasswordData('newPassword', value)}
                placeholder="Enter new password"
                secureTextEntry
                error={errors.newPassword}
                leftIcon="lock"
              />

              <Input
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChangeText={(value) => updatePasswordData('confirmPassword', value)}
                placeholder="Confirm new password"
                secureTextEntry
                error={errors.confirmPassword}
                leftIcon="lock"
              />

              <Button
                title="Change Password"
                onPress={handleChangePassword}
                loading={isLoading}
                style={styles.passwordButton}
              />
            </View>
          )}
        </Card>

        {/* Settings Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Location Services</Text>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor={locationEnabled ? '#fff' : '#fff'}
            />
          </View>
        </Card>

        {/* Logout Section */}
        <Card style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>

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

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowLogoutModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Logout"
                onPress={confirmLogout}
                style={styles.modalLogoutButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  toggleIcon: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameInput: {
    flex: 1,
  },
  updateButton: {
    marginTop: 10,
  },
  passwordSection: {
    paddingTop: 10,
  },
  passwordButton: {
    marginTop: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  logoutButton: {
    borderColor: '#dc3545',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  modalLogoutButton: {
    flex: 1,
    backgroundColor: '#dc3545',
  },
});

// Default export to satisfy Expo Router (this file should be treated as a route)
export default ProfileScreen;

