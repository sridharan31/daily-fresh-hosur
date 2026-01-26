import { useCallback, useEffect, useState } from 'react';
import { UserLocation, getUserDefaultLocation, getUserLocations } from '../../lib/services/customer/locationService';
import { useAuth } from './useAuth';

export const useCustomerLocation = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserLocation();
    }
  }, [user?.id]);

  const loadUserLocation = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get default location first
      const defaultLocation = await getUserDefaultLocation(user.id);
      if (defaultLocation) {
        setSelectedLocation(defaultLocation);
      } else {
        // If no default, get all locations and pick the first one
        const userLocations = await getUserLocations(user.id);
        if (userLocations.length > 0) {
          setSelectedLocation(userLocations[0]);
        }
      }

      // Also load all locations for reference
      const allLocations = await getUserLocations(user.id);
      setLocations(allLocations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load location';
      setError(errorMessage);
      console.error('Error loading user location:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateSelectedLocation = useCallback((location: UserLocation) => {
    setSelectedLocation(location);
  }, []);

  return {
    selectedLocation,
    locations,
    isLoading,
    error,
    loadUserLocation,
    updateSelectedLocation,
    locationString: selectedLocation
      ? `${selectedLocation.city}, ${selectedLocation.state}`
      : 'Select Location',
  };
};

export default useCustomerLocation;
