import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useUpdateProfile, useUserProfile } from '../../hooks/useUserQueries';

// Example component showing React Query + Styled Components
export const SimpleProfileExample: React.FC = () => {
  const { data: userProfile, isLoading, error, refetch } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      firstName: 'Updated',
      lastName: 'Name',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.errorCard]}>
          <Icon name="alert-circle" size={48} color="#ef4444" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>Unable to load your profile. Please try again.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header with Gradient */}
      <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Welcome back!</Text>
            <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.firstName?.[0] || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.firstName || 'User'} {userProfile?.lastName || ''}
              </Text>
              <Text style={styles.profileEmail}>{userProfile?.email || 'user@example.com'}</Text>
              <View style={styles.phoneContainer}>
                <Icon name="phone" size={14} color="#6b7280" />
                <Text style={styles.phoneText}>
                  {userProfile?.phone || '+1 (555) 000-0000'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
            style={[
              styles.editButton,
              updateProfileMutation.isPending && styles.editButtonDisabled,
            ]}
          >
            <Icon 
              name="edit-3" 
              size={16} 
              color={updateProfileMutation.isPending ? '#9ca3af' : '#fff'} 
            />
            <Text style={[
              styles.editButtonText,
              updateProfileMutation.isPending && styles.editButtonTextDisabled,
            ]}>
              {updateProfileMutation.isPending ? 'Updating...' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureList}>
          <FeatureCard
            icon="shopping-bag"
            title="Recent Orders"
            description="View your order history"
            color="#10b981"
            onPress={() => console.log('Orders pressed')}
          />
          
          <FeatureCard
            icon="heart"
            title="Favorites"
            description="Your saved products"
            color="#ef4444"
            onPress={() => console.log('Favorites pressed')}
          />
          
          <FeatureCard
            icon="map-pin"
            title="Addresses"
            description="Manage delivery locations"
            color="#3b82f6"
            onPress={() => console.log('Addresses pressed')}
          />
          
          <FeatureCard
            icon="credit-card"
            title="Payment Methods"
            description="Manage payment options"
            color="#8b5cf6"
            onPress={() => console.log('Payment pressed')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={20} color="#fff" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorCard: {
    maxWidth: 300,
    width: '100%',
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  errorIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#bfdbfe',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 20,
  },
  profileContainer: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#6b7280',
    marginTop: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  editButtonTextDisabled: {
    color: '#6b7280',
  },
  featureList: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 18,
  },
  featureDescription: {
    color: '#6b7280',
  },
});

export default SimpleProfileExample;