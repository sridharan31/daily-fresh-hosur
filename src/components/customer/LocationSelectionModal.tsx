import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserLocation, getCurrentLocation, getUserLocations, saveUserLocation, searchLocations } from '../../../lib/services/customer/locationService';

interface LocationSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: UserLocation) => void;
  userId: string;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  userId,
}) => {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'search' | 'detect'>('saved');

  useEffect(() => {
    if (visible && activeTab === 'saved') {
      loadSavedLocations();
    }
  }, [visible, activeTab]);

  const loadSavedLocations = async () => {
    try {
      setIsLoading(true);
      const userLocations = await getUserLocations(userId);
      setLocations(userLocations);
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved locations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search locations');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDetectLocation = async () => {
    try {
      setIsLoading(true);
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert('Error', 'Unable to detect current location. Please ensure location permissions are enabled.');
        return;
      }

      // For now, use a default location based on coordinates
      const newLocation: UserLocation = {
        id: '',
        userId,
        title: 'Current Location',
        address: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635109',
        latitude: coords.latitude,
        longitude: coords.longitude,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the location
      const savedLocation = await saveUserLocation(userId, {
        title: 'Current Location',
        address: newLocation.address,
        city: newLocation.city,
        state: newLocation.state,
        postalCode: newLocation.postalCode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isDefault: false,
      });

      onSelectLocation(savedLocation);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to detect location');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    try {
      setIsLoading(true);
      const newLocation = await saveUserLocation(userId, {
        title: result.address,
        address: result.address,
        city: result.city,
        state: result.state,
        postalCode: result.postalCode,
        latitude: result.latitude,
        longitude: result.longitude,
        isDefault: false,
      });

      onSelectLocation(newLocation);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save location');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationItem = (item: UserLocation) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => {
        onSelectLocation(item);
        onClose();
      }}
    >
      <View style={styles.locationIcon}>
        <Icon name="location-on" size={24} color="#4CAF50" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationTitle}>{item.title}</Text>
        <Text style={styles.locationAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={styles.locationCity}>
          {item.city}, {item.state} {item.postalCode}
        </Text>
      </View>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSearchResult = (item: any) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectSearchResult(item)}
    >
      <View style={styles.resultIcon}>
        <Icon name="place" size={20} color="#666" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultAddress}>{item.address}</Text>
        <Text style={styles.resultCity}>{item.city}, {item.state} {item.postalCode}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Delivery Location</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Icon name="bookmark" size={20} color={activeTab === 'saved' ? '#4CAF50' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Icon name="search" size={20} color={activeTab === 'search' ? '#4CAF50' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'detect' && styles.activeTab]}
            onPress={() => setActiveTab('detect')}
          >
            <Icon name="my-location" size={20} color={activeTab === 'detect' ? '#4CAF50' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'detect' && styles.activeTabText]}>Current</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Saved Locations Tab */}
          {activeTab === 'saved' && (
            <>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Loading locations...</Text>
                </View>
              ) : (
                <FlatList
                  data={locations}
                  renderItem={({ item }) => renderLocationItem(item)}
                  keyExtractor={item => item.id}
                  scrollEnabled={true}
                  style={{ flex: 1 }}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Icon name="location-off" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>No saved locations</Text>
                      <Text style={styles.emptySubtext}>Search or detect your location</Text>
                    </View>
                  }
                />
              )}
            </>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <>
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by city or postal code"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#ccc"
                  onSubmitEditing={handleSearch}
                />
              </View>

              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  renderItem={({ item }) => renderSearchResult(item)}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  scrollEnabled={true}
                  style={{ flex: 1 }}
                  ListEmptyComponent={
                    searchQuery ? (
                      <View style={styles.emptyState}>
                        <Icon name="search-off" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                      </View>
                    ) : (
                      <View style={styles.emptyState}>
                        <Icon name="search" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>Search for a location</Text>
                        <Text style={styles.emptySubtext}>Enter a city or postal code</Text>
                      </View>
                    )
                  }
                />
              )}
            </>
          )}

          {/* Detect Current Location Tab */}
          {activeTab === 'detect' && (
            <View style={styles.detectContainer}>
              <Icon name="location-on" size={64} color="#4CAF50" />
              <Text style={styles.detectTitle}>Use Current Location</Text>
              <Text style={styles.detectSubtitle}>
                Grant location permission to detect your current location
              </Text>

              <TouchableOpacity
                style={styles.detectButton}
                onPress={handleDetectLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="my-location" size={20} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.detectButtonText}>
                  {isLoading ? 'Detecting...' : 'Detect Location'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.detectInfo}>
                This will use your device's GPS to find your current location and save it for faster delivery.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationCity: {
    fontSize: 11,
    color: '#999',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  resultCity: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  detectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  detectSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  detectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  detectInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LocationSelectionModal;
