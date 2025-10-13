import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useUserProfile } from '../../hooks/useUserQueries';
import { AuthDemo } from '../auth/AuthDemo';
import SimpleProfileExample from './SimpleProfileExample';
import UserProfileForm from './UserProfileForm';

type TabType = 'profile' | 'form' | 'image' | 'auth' | 'demo';

// Main demo component showcasing all installed packages
export const PackageDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('demo');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // React Query example
  const { data: userProfile, isLoading } = useUserProfile();

  // Expo Image Picker example
  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera is required!');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Focus effect example (navigation hook)
  useFocusEffect(
    useCallback(() => {
      console.log('PackageDemo screen focused');
      return () => {
        console.log('PackageDemo screen unfocused');
      };
    }, [])
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SimpleProfileExample />;
      case 'form':
        return <UserProfileForm />;
      case 'image':
        return <ImagePickerDemo selectedImage={selectedImage} onPickImage={pickImage} onTakePhoto={takePhoto} />;
      case 'auth':
        return <AuthDemo />;
      default:
        return <OverviewDemo userProfile={userProfile} isLoading={isLoading} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabList}>
            <TabButton
              title="Overview"
              icon="home"
              active={activeTab === 'demo'}
              onPress={() => setActiveTab('demo')}
            />
            <TabButton
              title="React Query"
              icon="database"
              active={activeTab === 'profile'}
              onPress={() => setActiveTab('profile')}
            />
            <TabButton
              title="Forms"
              icon="edit-3"
              active={activeTab === 'form'}
              onPress={() => setActiveTab('form')}
            />
            <TabButton
              title="Auth"
              icon="shield"
              active={activeTab === 'auth'}
              onPress={() => setActiveTab('auth')}
            />
            <TabButton
              title="Images"
              icon="camera"
              active={activeTab === 'image'}
              onPress={() => setActiveTab('image')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

interface TabButtonProps {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, icon, active, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}
    >
      <Icon name={icon} size={16} color={active ? '#3b82f6' : '#6b7280'} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

interface ImagePickerDemoProps {
  selectedImage: string | null;
  onPickImage: () => void;
  onTakePhoto: () => void;
}

const ImagePickerDemo: React.FC<ImagePickerDemoProps> = ({
  selectedImage,
  onPickImage,
  onTakePhoto,
}) => {
  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.demoHeader}>
        <Icon name="camera" size={48} color="white" />
        <Text style={styles.demoTitle}>Image Picker Demo</Text>
        <Text style={styles.demoSubtitle}>
          Expo Image Picker with camera and gallery access
        </Text>
      </LinearGradient>

      <View style={styles.demoContent}>
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="image" size={48} color="#9ca3af" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onPickImage} style={styles.imageButton}>
            <Icon name="folder" size={20} color="white" />
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTakePhoto} style={styles.imageButton}>
            <Icon name="camera" size={20} color="white" />
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

interface OverviewDemoProps {
  userProfile: any;
  isLoading: boolean;
}

const OverviewDemo: React.FC<OverviewDemoProps> = ({ userProfile, isLoading }) => {
  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient colors={['#0ea5e9', '#3b82f6']} style={styles.demoHeader}>
        <Icon name="package" size={48} color="white" />
        <Text style={styles.demoTitle}>Package Integration Demo</Text>
        <Text style={styles.demoSubtitle}>
          All packages working together seamlessly
        </Text>
      </LinearGradient>

      <View style={styles.demoContent}>
        <View style={styles.packageGrid}>
          <PackageCard
            title="NativeWind"
            description="Tailwind CSS for React Native"
            icon="wind"
            status="Configured"
            color="#06b6d4"
          />
          
          <PackageCard
            title="React Query"
            description="Data fetching & caching"
            icon="database"
            status={isLoading ? 'Loading...' : 'Active'}
            color="#10b981"
          />
          
          <PackageCard
            title="Vector Icons"
            description="Feather icon library"
            icon="feather"
            status="Loaded"
            color="#f59e0b"
          />
          
          <PackageCard
            title="React Hook Form"
            description="Form validation with Zod"
            icon="edit-3"
            status="Ready"
            color="#8b5cf6"
          />
          
          <PackageCard
            title="Authentication"
            description="Login/Register with error handling"
            icon="shield"
            status="Complete"
            color="#06b6d4"
          />
          
          <PackageCard
            title="Image Picker"
            description="Camera & gallery access"
            icon="camera"
            status="Configured"
            color="#ef4444"
          />
          
          <PackageCard
            title="Linear Gradient"
            description="Beautiful gradients"
            icon="layers"
            status="Working"
            color="#6366f1"
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Packages"
            value="10+"
            icon="package"
            color="#3b82f6"
          />
          <StatCard
            title="Bundle Size"
            value="Optimized"
            icon="zap"
            color="#10b981"
          />
          <StatCard
            title="Performance"
            value="Excellent"
            icon="trending-up"
            color="#f59e0b"
          />
        </View>

        {userProfile && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>React Query Data:</Text>
            <View style={styles.userInfoCard}>
              <Text style={styles.userInfoText}>
                Name: {userProfile.firstName || 'Not set'} {userProfile.lastName || ''}
              </Text>
              <Text style={styles.userInfoText}>
                Email: {userProfile.email || 'Not set'}
              </Text>
              <Text style={styles.userInfoText}>
                Status: {isLoading ? 'Loading...' : 'Loaded'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

interface PackageCardProps {
  title: string;
  description: string;
  icon: string;
  status: string;
  color: string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  description,
  icon,
  status,
  color,
}) => {
  return (
    <View style={styles.packageCard}>
      <View style={[styles.packageIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="white" />
      </View>
      <Text style={styles.packageTitle}>{title}</Text>
      <Text style={styles.packageDescription}>{description}</Text>
      <View style={styles.packageStatus}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#dbeafe',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  demoHeader: {
    padding: 32,
    alignItems: 'center',
  },
  demoTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  demoSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  demoContent: {
    padding: 24,
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  packageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 24,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PackageDemo;