// src/services/location/geocoding.ts
import config from '../../../src/config/environment';

interface GeocodingResult {
  success: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  formattedAddress?: string;
  addressComponents?: AddressComponents;
  placeId?: string;
  error?: string;
  address?: string;
}

interface AddressComponents {
  streetNumber: string;
  streetName: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface SuggestionsResult {
  success: boolean;
  suggestions: AddressSuggestion[];
  error?: string;
}

interface DeliveryArea {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
}

interface PostalCodeValidation {
  isValid: boolean;
  area?: DeliveryArea;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  error?: string;
}

class GeocodingService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.GOOGLE_MAPS_API_KEY || '';
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  // Convert address to coordinates
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const url = `${this.baseUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          coordinates: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          formattedAddress: result.formatted_address,
          addressComponents: this.parseAddressComponents(result.address_components),
          placeId: result.place_id,
        };
      } else {
        throw new Error(data.error_message || 'Geocoding failed');
      }
    } catch (error: any) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error?.message || 'Geocoding failed',
      };
    }
  }

  // Convert coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    try {
      const url = `${this.baseUrl}?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          address: result.formatted_address,
          addressComponents: this.parseAddressComponents(result.address_components),
          placeId: result.place_id,
          coordinates: {
            latitude,
            longitude,
          },
        };
      } else {
        throw new Error(data.error_message || 'Reverse geocoding failed');
      }
    } catch (error: any) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error?.message || 'Reverse geocoding failed',
      };
    }
  }

  // Get address suggestions (autocomplete)
  async getAddressSuggestions(input: string, sessionToken: string | null = null): Promise<SuggestionsResult> {
    try {
      const autocompleteUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
      let url = `${autocompleteUrl}?input=${encodeURIComponent(input)}&key=${this.apiKey}&types=address`;
      
      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return {
          success: true,
          suggestions: data.predictions.map((prediction: any) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
          })),
        };
      } else {
        throw new Error(data.error_message || 'Autocomplete failed');
      }
    } catch (error: any) {
      console.error('Autocomplete error:', error);
      return {
        success: false,
        error: error?.message || 'Autocomplete failed',
        suggestions: [],
      };
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string, sessionToken: string | null = null): Promise<GeocodingResult> {
    try {
      const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      let url = `${detailsUrl}?place_id=${placeId}&key=${this.apiKey}&fields=address_component,formatted_address,geometry`;
      
      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const result = data.result;
        return {
          success: true,
          coordinates: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          formattedAddress: result.formatted_address,
          addressComponents: this.parseAddressComponents(result.address_components),
          placeId: placeId,
        };
      } else {
        throw new Error(data.error_message || 'Place details failed');
      }
    } catch (error: any) {
      console.error('Place details error:', error);
      return {
        success: false,
        error: error?.message || 'Place details failed',
      };
    }
  }

  // Parse address components
  parseAddressComponents(components: any[]): AddressComponents {
    const parsed: AddressComponents = {
      streetNumber: '',
      streetName: '',
      locality: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    };

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        parsed.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        parsed.streetName = component.long_name;
      } else if (types.includes('locality')) {
        parsed.locality = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        parsed.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name;
      } else if (types.includes('country')) {
        parsed.country = component.long_name;
      } else if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name;
      }
    });

    return parsed;
  }

  // Validate postal code for delivery area
  async validatePostalCode(postalCode: string, deliveryAreas: DeliveryArea[]): Promise<PostalCodeValidation> {
    try {
      const geocodeResult = await this.geocodeAddress(postalCode);
      
      if (!geocodeResult.success || !geocodeResult.coordinates) {
        return {
          isValid: false,
          error: 'Invalid postal code',
        };
      }

      const { latitude, longitude } = geocodeResult.coordinates;
      
      // Check if the postal code falls within any delivery area
      for (const area of deliveryAreas) {
        const distance = this.calculateDistance(
          latitude, 
          longitude, 
          area.centerLat, 
          area.centerLon
        );
        
        if (distance <= area.radiusKm) {
          return {
            isValid: true,
            area: area,
            coordinates: { latitude, longitude },
            distance: distance,
          };
        }
      }

      return {
        isValid: false,
        error: 'Delivery not available in this area',
        coordinates: { latitude, longitude },
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: 'Failed to validate postal code',
      };
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new GeocodingService();
