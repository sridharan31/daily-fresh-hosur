import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useUpdateProfile, useUserProfile } from '../../hooks/useUserQueries';

// Example component showing NativeWind + React Query usage
export const ProfileExample: React.FC = () => {
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
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-white p-6 rounded-2xl shadow-soft">
          <Text className="text-gray-600 text-center">Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-4">
        <View className="bg-white p-6 rounded-2xl shadow-soft max-w-sm w-full">
          <Icon name="alert-circle" size={48} color="#ef4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text className="text-gray-800 text-lg font-semibold text-center mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            Unable to load your profile. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary-500 py-3 px-6 rounded-xl"
          >
            <Text className="text-white font-semibold text-center">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0ea5e9', '#0284c7']}
        className="px-6 pt-12 pb-8"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-1">
              Welcome back!
            </Text>
            <Text className="text-blue-100">
              Manage your profile and preferences
            </Text>
          </View>
          <TouchableOpacity className="bg-white/20 p-3 rounded-full">
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View className="px-6 -mt-4">
        <View className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">
                {userProfile?.firstName?.[0] || 'U'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-xl font-semibold">
                {userProfile?.firstName || 'User'} {userProfile?.lastName || ''}
              </Text>
              <Text className="text-gray-600">{userProfile?.email || 'user@example.com'}</Text>
              <View className="flex-row items-center mt-1">
                <Icon name="phone" size={14} color="#6b7280" />
                <Text className="text-gray-500 ml-1 text-sm">
                  {userProfile?.phone || '+1 (555) 000-0000'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
            className={`py-3 px-6 rounded-xl flex-row items-center justify-center ${
              updateProfileMutation.isPending 
                ? 'bg-gray-300' 
                : 'bg-primary-500'
            }`}
          >
            <Icon 
              name="edit-3" 
              size={16} 
              color={updateProfileMutation.isPending ? '#9ca3af' : '#fff'} 
            />
            <Text className={`ml-2 font-semibold ${
              updateProfileMutation.isPending 
                ? 'text-gray-500' 
                : 'text-white'
            }`}>
              {updateProfileMutation.isPending ? 'Updating...' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View className="space-y-4">
          <FeatureCard
            icon="shopping-bag"
            title="Recent Orders"
            description="View your order history"
            color="bg-green-500"
            onPress={() => console.log('Orders pressed')}
          />
          
          <FeatureCard
            icon="heart"
            title="Favorites"
            description="Your saved products"
            color="bg-red-500"
            onPress={() => console.log('Favorites pressed')}
          />
          
          <FeatureCard
            icon="map-pin"
            title="Addresses"
            description="Manage delivery locations"
            color="bg-blue-500"
            onPress={() => console.log('Addresses pressed')}
          />
          
          <FeatureCard
            icon="credit-card"
            title="Payment Methods"
            description="Manage payment options"
            color="bg-purple-500"
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
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-soft p-4 flex-row items-center"
    >
      <View className={`w-12 h-12 ${color} rounded-full items-center justify-center mr-4`}>
        <Icon name={icon} size={20} color="#fff" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-semibold text-lg">{title}</Text>
        <Text className="text-gray-600">{description}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

export default ProfileExample;