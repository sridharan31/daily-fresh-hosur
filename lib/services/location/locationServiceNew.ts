// // src/services/location/locationService.ts
// import { PermissionsAndroid, Platform } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

// interface LocationOptions {
//   enableHighAccuracy?: boolean;
//   timeout?: number;
//   maximumAge?: number;
//   distanceFilter?: number;
//   interval?: number;
//   fastestInterval?: number;
// }

// interface DeliveryArea {
//   id: string;
//   name: string;
//   centerLat: number;
//   centerLon: number;
//   radiusKm: number;
// }

// interface LocationResult {
//   isWithin: boolean;
//   area?: DeliveryArea;
//   distance?: number;
//   nearestArea?: {
//     area: DeliveryArea;
//     distance: number;
//   };
// }

// interface Address {
//   id: string;
//   name: string;
//   street: string;
//   area: string;
//   city: string;
//   pincode: string;
//   state: string;
//   landmark?: string;
//   isDefault: boolean;
//   coordinates?: {
//     latitude: number;
//     longitude: number;
//   };
// }

// interface ValidationResult {
//   isValid: boolean;
//   address?: Address;
// }

// type LocationUpdateCallback = (position: any | null, error?: string) => void;
// type LocationErrorCallback = (error: any) => void;

// class LocationService {
//   private watchId: number | null = null;
//   private currentLocation: any | null = null;
//   private locationUpdateListeners: LocationUpdateCallback[] = [];

//   constructor() {
//     this.watchId = null;
//     this.currentLocation = null;
//     this.locationUpdateListeners = [];
//   }

//   // Request location permissions
//   async requestLocationPermission(): Promise<boolean> {
//     try {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Access Required',
//             message: 'This app needs to access your location for delivery services',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } else {
//         const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//         return result === RESULTS.GRANTED;
//       }
//     } catch (error) {
//       console.error('Location permission error:', error);
//       return false;
//     }
//   }

//   // Get current location
//   async getCurrentLocation(options: LocationOptions = {}): Promise<any> {
//     const hasPermission = await this.requestLocationPermission();
    
//     if (!hasPermission) {
//       throw new Error('Location permission denied');
//     }

//     const defaultOptions: LocationOptions = {
//       enableHighAccuracy: true,
//       timeout: 15000,
//       maximumAge: 10000,
//       ...options,
//     };

//     return new Promise((resolve, reject) => {
//       Geolocation.getCurrentPosition(
//         (position) => {
//           this.currentLocation = position;
//           resolve(position);
//         },
//         (error) => {
//           console.error('Location error:', error);
//           reject(this.getLocationError(error));
//         },
//         defaultOptions,
//       );
//     });
//   }

//   // Watch location changes
//   async watchLocation(callback: LocationUpdateCallback, options: LocationOptions = {}): Promise<number> {
//     const hasPermission = await this.requestLocationPermission();
    
//     if (!hasPermission) {
//       throw new Error('Location permission denied');
//     }

//     const defaultOptions: LocationOptions = {
//       enableHighAccuracy: true,
//       distanceFilter: 10, // meters
//       interval: 5000, // ms
//       fastestInterval: 2000, // ms
//       ...options,
//     };

//     this.watchId = Geolocation.watchPosition(
//       (position) => {
//         this.currentLocation = position;
//         callback(position);
//       },
//       (error) => {
//         console.error('Watch location error:', error);
//         callback(null, this.getLocationError(error));
//       },
//       defaultOptions,
//     );

//     return this.watchId;
//   }

//   // Stop watching location
//   stopWatchingLocation(): void {
//     if (this.watchId !== null) {
//       Geolocation.clearWatch(this.watchId);
//       this.watchId = null;
//     }
//   }

//   // Calculate distance between two points
//   calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//     const R = 6371; // Earth's radius in kilometers
//     const dLat = this.toRadians(lat2 - lat1);
//     const dLon = this.toRadians(lon2 - lon1);
    
//     const a = 
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
    
//     return distance; // Distance in kilometers
//   }

//   toRadians(degrees: number): number {
//     return degrees * (Math.PI / 180);
//   }

//   // Check if location is within delivery area
//   isWithinDeliveryArea(userLat: number, userLon: number, deliveryAreas: DeliveryArea[]): LocationResult {
//     for (const area of deliveryAreas) {
//       const distance = this.calculateDistance(
//         userLat, 
//         userLon, 
//         area.centerLat, 
//         area.centerLon
//       );
      
//       if (distance <= area.radiusKm) {
//         return {
//           isWithin: true,
//           area: area,
//           distance: distance,
//         };
//       }
//     }
    
//     return {
//       isWithin: false,
//       nearestArea: this.findNearestArea(userLat, userLon, deliveryAreas),
//     };
//   }

//   findNearestArea(userLat: number, userLon: number, deliveryAreas: DeliveryArea[]): { area: DeliveryArea; distance: number } | null {
//     let nearest = null;
//     let minDistance = Infinity;
    
//     for (const area of deliveryAreas) {
//       const distance = this.calculateDistance(
//         userLat, 
//         userLon, 
//         area.centerLat, 
//         area.centerLon
//       );
      
//       if (distance < minDistance) {
//         minDistance = distance;
//         nearest = {
//           area: area,
//           distance: distance,
//         };
//       }
//     }
    
//     return nearest;
//   }

//   // Get location error message
//   getLocationError(error: any): string {
//     switch (error.code) {
//       case 1:
//         return 'Location permission denied. Please enable location access.';
//       case 2:
//         return 'Location unavailable. Please check your GPS settings.';
//       case 3:
//         return 'Location request timed out. Please try again.';
//       default:
//         return 'Unable to get location. Please try again.';
//     }
//   }

//   // Get cached location
//   getCachedLocation(): any {
//     return this.currentLocation;
//   }

//   // Check if location services are enabled
//   async isLocationEnabled(): Promise<boolean> {
//     return new Promise((resolve) => {
//       Geolocation.getCurrentPosition(
//         () => resolve(true),
//         () => resolve(false),
//         { timeout: 1000 }
//       );
//     });
//   }

//   addLocationUpdateListener(callback: LocationUpdateCallback): void {
//     this.locationUpdateListeners.push(callback);
//   }

//   removeLocationUpdateListener(callback: LocationUpdateCallback): void {
//     this.locationUpdateListeners = this.locationUpdateListeners.filter(
//       listener => listener !== callback
//     );
//   }

//   notifyLocationUpdate(location: any): void {
//     this.locationUpdateListeners.forEach(callback => callback(location));
//   }

//   // Handle permission denied
//   handlePermissionDenied(): void {
//     // This would typically open device settings
//     console.log('Opening location settings...');
//   }

//   // Validate and geocode address
//   async validateAndGeocodeAddress(address: Address): Promise<ValidationResult> {
//     // Mock implementation - in real app this would use a geocoding service
//     return {
//       isValid: true,
//       address: {
//         ...address,
//         id: Date.now().toString(),
//         isDefault: false,
//         coordinates: {
//           latitude: 0,
//           longitude: 0,
//         }
//       }
//     };
//   }

//   // Get saved addresses
//   async getSavedAddresses(): Promise<Address[]> {
//     // Mock implementation - in real app this would fetch from storage/API
//     return [];
//   }

//   // Check if location is in delivery area
//   isLocationInDeliveryArea(coordinates: { latitude: number; longitude: number }): { isValid: boolean; area: string } {
//     // Mock implementation - in real app this would check against delivery zones
//     return {
//       isValid: true,
//       area: 'Mock Area'
//     };
//   }
// }

// export default new LocationService();
