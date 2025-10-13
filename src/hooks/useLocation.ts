// app/hooks/useLocation.ts (Custom hook for location services)
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import locationService from '../../lib/services/location/locationService';
import { DeliveryAddress, LocationCoordinates } from '../../lib/types/delivery';

interface UseLocationReturn {
  currentLocation: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  validateAddress: (address: Partial<DeliveryAddress>) => Promise<{
    isValid: boolean;
    address?: DeliveryAddress;
    error?: string;
  }>;
  savedAddresses: DeliveryAddress[];
  refreshSavedAddresses: () => Promise<void>;
  isInDeliveryArea: (coordinates: LocationCoordinates) => boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);

  useEffect(() => {
    // Load saved addresses on mount
    refreshSavedAddresses();
    
    // Get initial location
    getCurrentLocation();
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location as LocationCoordinates);
    } catch (err: any) {
      setError(err.message);
      
      if (err.message.includes('permission')) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find nearby stores and get delivery estimates.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => console.log('Open settings')},
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const validateAddress = useCallback(async (address: Partial<DeliveryAddress>) => {
    // Mock implementation for now
    return {
      isValid: true,
      address: {
        ...address,
        id: Date.now().toString(),
        name: address.name || 'Address',
        street: address.street || '',
        area: address.area || '',
        city: address.city || '',
        pincode: address.pincode || '',
        state: address.state || '',
        isDefault: false,
      } as DeliveryAddress
    };
  }, []);

  const refreshSavedAddresses = useCallback(async () => {
    try {
      // Mock implementation - in real app this would fetch from storage/API
      setSavedAddresses([
        {
          id: '1',
          name: 'Home',
          street: '123 Main St',
          area: 'Downtown',
          city: 'Sample City',
          pincode: '12345',
          state: 'Sample State',
          isDefault: true,
          coordinates: { latitude: 0, longitude: 0 }
        }
      ]);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  }, []);

  const isInDeliveryArea = useCallback((coordinates: LocationCoordinates) => {
    // Mock implementation - in real app this would check against delivery zones
    return true;
  }, []);

  return {
    currentLocation,
    loading,
    error,
    getCurrentLocation,
    validateAddress,
    savedAddresses,
    refreshSavedAddresses,
    isInDeliveryArea,
  };
};


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
