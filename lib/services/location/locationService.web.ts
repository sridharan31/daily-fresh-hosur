// app/services/location/locationService.web.ts
import { Platform } from 'react-native';

// Web Geolocation API types
declare global {
  interface Window {
    navigator: Navigator;
  }

  interface Navigator {
    geolocation: Geolocation;
    permissions?: Permissions;
  }

  interface Geolocation {
    getCurrentPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback,
      options?: GeolocationOptions
    ): void;
    watchPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback,
      options?: GeolocationOptions
    ): number;
    clearWatch(watchId: number): void;
  }

  interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }

  interface PositionCallback {
    (position: GeolocationPosition): void;
  }

  interface PositionErrorCallback {
    (error: GeolocationPositionError): void;
  }

  interface GeolocationPosition {
    coords: GeolocationCoordinates;
    timestamp: number;
  }

  interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  }

  interface GeolocationPositionError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }

  interface Permissions {
    query(permissionDesc: {name: string}): Promise<PermissionStatus>;
  }

  interface PermissionStatus {
    state: 'granted' | 'denied' | 'prompt';
  }
}

// Get navigator safely
const getNavigator = (): Navigator | undefined => {
  try {
    return (globalThis as any).navigator;
  } catch {
    return undefined;
  }
};

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
  fastestInterval?: number;
}

interface DeliveryArea {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
}

interface LocationResult {
  isWithin: boolean;
  area?: DeliveryArea;
  distance?: number;
  nearestArea?: {
    area: DeliveryArea;
    distance: number;
  } | null;
}

interface Address {
  id: string;
  name: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedArea?: DeliveryArea;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

class LocationService {
  private deliveryAreas: DeliveryArea[] = [
    {
      id: 'abu-dhabi-center',
      name: 'Abu Dhabi Center',
      centerLat: 24.4539,
      centerLon: 54.3773,
      radiusKm: 15,
    },
    {
      id: 'dubai-center',
      name: 'Dubai Center',
      centerLat: 25.2048,
      centerLon: 55.2708,
      radiusKm: 20,
    },
    {
      id: 'sharjah-center',
      name: 'Sharjah Center',
      centerLat: 25.3463,
      centerLon: 55.4209,
      radiusKm: 12,
    },
  ];

  async requestLocationPermission(): Promise<boolean> {
    // Web location permission using HTML5 Geolocation API
    const navigator = getNavigator();
    if (navigator?.geolocation) {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({name: 'geolocation'});
          return permission.state === 'granted' || permission.state === 'prompt';
        }
        return true; // Assume permission for web fallback
      } catch (error) {
        console.warn('Geolocation permission query failed:', error);
        return true; // Assume permission for web fallback
      }
    }
    return false;
  }

  async getCurrentLocation(options: LocationOptions = {}): Promise<Location> {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    };

    return new Promise((resolve, reject) => {
      const navigator = getNavigator();
      if (!navigator?.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          });
        },
        (error: GeolocationPositionError) => {
          let errorMessage = 'Location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: defaultOptions.enableHighAccuracy,
          timeout: defaultOptions.timeout,
          maximumAge: defaultOptions.maximumAge,
        }
      );
    });
  }

  async watchLocation(
    callback: (location: Location) => void,
    errorCallback?: (error: Error) => void,
    options: LocationOptions = {}
  ): Promise<number> {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    };

    const navigator = getNavigator();
    if (!navigator?.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      if (errorCallback) errorCallback(error);
      return -1;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        });
      },
      (error: GeolocationPositionError) => {
        let errorMessage = 'Location watch error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        if (errorCallback) errorCallback(new Error(errorMessage));
      },
      {
        enableHighAccuracy: defaultOptions.enableHighAccuracy,
        timeout: defaultOptions.timeout,
        maximumAge: defaultOptions.maximumAge,
      }
    );

    return watchId;
  }

  clearWatch(watchId: number): void {
    const navigator = getNavigator();
    if (navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  checkDeliveryAvailability(latitude: number, longitude: number): LocationResult {
    let nearestArea: {area: DeliveryArea; distance: number} | null = null;
    let minDistance = Infinity;

    for (const area of this.deliveryAreas) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        area.centerLat,
        area.centerLon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestArea = {area, distance};
      }

      if (distance <= area.radiusKm) {
        return {
          isWithin: true,
          area,
          distance,
          nearestArea,
        };
      }
    }

    return {
      isWithin: false,
      distance: minDistance,
      nearestArea,
    };
  }

  async validateAddress(address: Partial<Address>): Promise<ValidationResult> {
    // Web fallback - basic validation
    if (!address.coordinates) {
      return {
        isValid: false,
        message: 'Address coordinates are required for web validation',
      };
    }

    const result = this.checkDeliveryAvailability(
      address.coordinates.latitude,
      address.coordinates.longitude
    );

    if (result.isWithin) {
      return {
        isValid: true,
        message: `Delivery available in ${result.area?.name}`,
      };
    }

    return {
      isValid: false,
      message: result.nearestArea
        ? `Delivery not available. Nearest area: ${result.nearestArea.area.name} (${result.nearestArea.distance.toFixed(1)}km away)`
        : 'Delivery not available in your area',
      suggestedArea: result.nearestArea?.area,
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<Address | null> {
    // Web fallback - return basic address structure
    console.warn('Reverse geocoding not available in web version');
    return {
      id: `web-${Date.now()}`,
      name: 'Web Address',
      street: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      area: 'Unknown Area',
      city: 'Unknown City',
      pincode: '00000',
      state: 'UAE',
      isDefault: false,
      coordinates: {
        latitude,
        longitude,
      },
    };
  }

  getDeliveryAreas(): DeliveryArea[] {
    return this.deliveryAreas;
  }

  isLocationServiceEnabled(): Promise<boolean> {
    // Web geolocation availability check
    const navigator = getNavigator();
    return Promise.resolve(!!navigator?.geolocation);
  }
}

export default new LocationService();
