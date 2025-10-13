import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export const AuthDemo: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<'login' | 'register'>('login');

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentForm === 'login' && styles.activeTab]}
          onPress={() => setCurrentForm('login')}
        >
          <Icon
            name="log-in"
            size={16}
            color={currentForm === 'login' ? '#3b82f6' : '#6b7280'}
          />
          <Text style={[
            styles.tabText,
            currentForm === 'login' && styles.activeTabText,
          ]}>
            Login Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentForm === 'register' && styles.activeTab]}
          onPress={() => setCurrentForm('register')}
        >
          <Icon
            name="user-plus"
            size={16}
            color={currentForm === 'register' ? '#10b981' : '#6b7280'}
          />
          <Text style={[
            styles.tabText,
            currentForm === 'register' && styles.activeTabText,
          ]}>
            Register Form
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <View style={styles.formContent}>
        {currentForm === 'login' ? <LoginForm /> : <RegisterForm />}
      </View>

      {/* Features Info */}
      <View style={styles.featuresContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.featuresList}>
            <FeatureChip
              icon="shield"
              title="Zod Validation"
              description="Type-safe form validation"
            />
            <FeatureChip
              icon="alert-triangle"
              title="Error Handling"
              description="Comprehensive API errors"
            />
            <FeatureChip
              icon="eye"
              title="Password Strength"
              description="Real-time validation"
            />
            <FeatureChip
              icon="wifi-off"
              title="Network Errors"
              description="Offline handling"
            />
            <FeatureChip
              icon="lock"
              title="Security"
              description="Input sanitization"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

interface FeatureChipProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureChip: React.FC<FeatureChipProps> = ({ icon, title, description }) => {
  return (
    <View style={styles.featureChip}>
      <Icon name={icon} size={16} color="#3b82f6" />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#f0f9ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  formContent: {
    flex: 1,
    marginTop: 8,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
  },
  featuresList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  featureDescription: {
    fontSize: 10,
    color: '#6b7280',
  },
});

export default AuthDemo;