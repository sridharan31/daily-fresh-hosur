import { supabase } from '../../supabase/client';

export interface UserLocation {
  id: string;
  userId: string;
  title: string; // Home, Office, Other
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationSearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

/**
 * Location Service - Handles user location management
 */

/**
 * Get user's saved delivery addresses
 */
export const getUserLocations = async (userId: string): Promise<UserLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;

    return (data || []).map(location => ({
      id: location.id,
      userId: location.user_id,
      title: location.title,
      address: location.address_line_1,
      city: location.city,
      state: location.state,
      postalCode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
      isDefault: location.is_default,
      createdAt: new Date(location.created_at),
      updatedAt: new Date(location.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching user locations:', error);
    throw error;
  }
};

/**
 * Get user's default delivery location
 */
export const getUserDefaultLocation = async (userId: string): Promise<UserLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      address: data.address_line_1,
      city: data.city,
      state: data.state,
      postalCode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching default location:', error);
    return null;
  }
};

/**
 * Save a new delivery address
 */
export const saveUserLocation = async (
  userId: string,
  location: Omit<UserLocation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<UserLocation> => {
  try {
    // If this is set as default, unset other defaults
    if (location.isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert([{
        user_id: userId,
        title: location.title,
        address_line_1: location.address,
        city: location.city,
        state: location.state,
        pincode: location.postalCode,
        latitude: location.latitude,
        longitude: location.longitude,
        is_default: location.isDefault,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      address: data.address_line_1,
      city: data.city,
      state: data.state,
      postalCode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error saving user location:', error);
    throw error;
  }
};

/**
 * Update an existing delivery address
 */
export const updateUserLocation = async (
  userId: string,
  locationId: string,
  updates: Partial<Omit<UserLocation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserLocation> => {
  try {
    // If updating to default, unset other defaults
    if (updates.isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', locationId);
    }

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.address) updateData.address_line_1 = updates.address;
    if (updates.city) updateData.city = updates.city;
    if (updates.state) updateData.state = updates.state;
    if (updates.postalCode) updateData.pincode = updates.postalCode;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

    const { data, error } = await supabase
      .from('user_addresses')
      .update(updateData)
      .eq('id', locationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      address: data.address_line_1,
      city: data.city,
      state: data.state,
      postalCode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

/**
 * Delete a delivery address
 */
export const deleteUserLocation = async (userId: string, locationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', locationId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user location:', error);
    throw error;
  }
};

/**
 * Search for locations by city/postal code
 * Mock implementation - in production, integrate with Google Maps or similar
 */
export const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
  try {
    // This is a mock implementation
    // In production, integrate with Google Maps API or similar service
    const mockResults: LocationSearchResult[] = [
      {
        id: '1',
        address: 'Hosur Main Road',
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635109',
        latitude: 12.7408,
        longitude: 77.8251,
      },
      {
        id: '2',
        address: 'Denkanikottai Road',
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635114',
        latitude: 12.7456,
        longitude: 77.8123,
      },
      {
        id: '3',
        address: 'Bagalur',
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635109',
        latitude: 12.7234,
        longitude: 77.8467,
      },
    ];

    // Filter by query
    return mockResults.filter(result =>
      result.address.toLowerCase().includes(query.toLowerCase()) ||
      result.city.toLowerCase().includes(query.toLowerCase()) ||
      result.postalCode.includes(query)
    );
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

/**
 * Get user's current location (requires geolocation permission)
 * Uses Geolocation API (web/native)
 */
export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        }
      );
    } else {
      // Fallback for platforms without geolocation
      resolve(null);
    }
  });
};

/**
 * Reverse geocode coordinates to address
 * Mock implementation - integrate with Google Maps or similar in production
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<UserLocation | null> => {
  try {
    // This is a mock implementation
    // In production, use Google Maps Geocoding API or similar
    return {
      id: '',
      userId: '',
      title: 'Current Location',
      address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Hosur',
      state: 'Tamil Nadu',
      postalCode: '635109',
      latitude,
      longitude,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Check if location is within delivery zone
 */
export const isLocationInDeliveryZone = async (
  postalCode: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('delivery_areas')
      .select('id')
      .contains('pincode', [postalCode])
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking delivery zone:', error);
    return false;
  }
};

/**
 * Get delivery charge for a location
 */
export const getDeliveryCharge = async (postalCode: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('delivery_areas')
      .select('delivery_charge')
      .contains('pincode', [postalCode])
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.delivery_charge || 0;
  } catch (error) {
    console.error('Error getting delivery charge:', error);
    return 0;
  }
};

export default {
  getUserLocations,
  getUserDefaultLocation,
  saveUserLocation,
  updateUserLocation,
  deleteUserLocation,
  searchLocations,
  getCurrentLocation,
  reverseGeocode,
  isLocationInDeliveryZone,
  getDeliveryCharge,
};
