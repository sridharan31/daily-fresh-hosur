// app/screens/admin/AdminProfileScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { AdminNavigationProp } from '../../navigation/navigationTypes';

const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const { user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phone || '',
    address: typeof user?.address === 'object' ? `${user.address.street}, ${user.address.city}` : '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Implementation for updating admin profile
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phone: user?.phone || '',
      address: typeof user?.address === 'object' ? `${user.address.street}, ${user.address.city}` : '',
    });
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Admin Profile"
        showBack
      />

      {!isEditing && (
        <View style={styles.buttonContainer}>
          <Button
            title="Edit Profile"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
            variant="outline"
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            {isEditing && (
              <Button
                title="Change Photo"
                onPress={() => {
                  Alert.alert('Change Photo', 'Photo change functionality will be implemented');
                }}
                style={styles.changePhotoButton}
                textStyle={styles.changePhotoText}
                variant="outline"
              />
            )}
          </View>
          
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userRole}>Administrator</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formSection}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={isEditing}
            inputStyle={!isEditing ? styles.disabledInput : undefined}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
            inputStyle={!isEditing ? styles.disabledInput : undefined}
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            editable={isEditing}
            keyboardType="phone-pad"
            inputStyle={!isEditing ? styles.disabledInput : undefined}
          />

          <Input
            label="Address"
            placeholder="Enter your address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            editable={isEditing}
            multiline
            numberOfLines={3}
            inputStyle={{
              ...styles.addressInput,
              ...(!isEditing ? styles.disabledInput : {}),
            }}
          />
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              style={styles.saveButton}
              loading={loading}
            />
            
            <Button
              title="Cancel"
              onPress={handleCancel}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
              variant="outline"
            />
          </View>
        )}

        {/* Additional Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <Button
            title="Change Password"
            onPress={() => {
              Alert.alert('Change Password', 'Password change functionality will be implemented');
            }}
            style={styles.settingButton}
            textStyle={styles.settingButtonText}
            variant="outline"
          />
          
          <Button
            title="Notification Settings"
            onPress={() => {
              Alert.alert('Notification Settings', 'Notification settings functionality will be implemented');
            }}
            style={styles.settingButton}
            textStyle={styles.settingButtonText}
            variant="outline"
          />
          
          <Button
            title="Security Settings"
            onPress={() => {
              Alert.alert('Security Settings', 'Security settings functionality will be implemented');
            }}
            style={styles.settingButton}
            textStyle={styles.settingButtonText}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editButton: {
    paddingHorizontal: 0,
  },
  editButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
  },
  addressInput: {
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  cancelButton: {
    borderColor: '#666',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#666',
  },
  settingsSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingButton: {
    backgroundColor: 'transparent',
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  settingButtonText: {
    color: '#333',
    textAlign: 'left',
  },
});

export default AdminProfileScreen;
