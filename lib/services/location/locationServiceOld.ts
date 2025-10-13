//  // src/services/location/locationService.ts
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

// type LocationUpdateCallback = (position: GeolocationPosition | null, error?: string) => void;

// class LocationService {
//   private watchId: number | null = null;
//   private currentLocation: GeolocationPosition | null = null;
//   private locationUpdateListeners: LocationUpdateCallback[] = [];

//   constructor() {
//     this.watchId = null;
//     this.currentLocation = null;
//     this.locationUpdateListeners = [];
//   }

//   // Request location permissions
//   async requestLocationPermission() {
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
//   async getCurrentLocation(options = {}) {
//     const hasPermission = await this.requestLocationPermission();
    
//     if (!hasPermission) {
//       throw new Error('Location permission denied');
//     }

//     const defaultOptions = {
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
//   async watchLocation(callback, options = {}) {
//     const hasPermission = await this.requestLocationPermission();
    
//     if (!hasPermission) {
//       throw new Error('Location permission denied');
//     }

//     const defaultOptions = {
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
//   stopWatchingLocation() {
//     if (this.watchId !== null) {
//       Geolocation.clearWatch(this.watchId);
//       this.watchId = null;
//     }
//   }

//   // Calculate distance between two points
//   calculateDistance(lat1, lon1, lat2, lon2) {
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

//   toRadians(degrees) {
//     return degrees * (Math.PI / 180);
//   }

//   // Check if location is within delivery area
//   isWithinDeliveryArea(userLat, userLon, deliveryAreas) {
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

//   findNearestArea(userLat, userLon, deliveryAreas) {
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
//   getLocationError(error) {
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
//   getCachedLocation() {
//     return this.currentLocation;
//   }

//   // Check if location services are enabled
//   async isLocationEnabled() {
//     return new Promise((resolve) => {
//       Geolocation.getCurrentPosition(
//         () => resolve(true),
//         () => resolve(false),
//         { timeout: 1000 }
//       );
//     });
//   }

//   // Location update listeners
//   locationUpdateListeners = [];

//   addLocationUpdateListener(callback) {
//     this.locationUpdateListeners.push(callback);
//   }

//   removeLocationUpdateListener(callback) {
//     this.locationUpdateListeners = this.locationUpdateListeners.filter(
//       listener => listener !== callback
//     );
//   }

//   notifyLocationUpdate(location) {
//     this.locationUpdateListeners.forEach(callback => callback(location));
//   }

//   // Handle permission denied
//   handlePermissionDenied() {
//     // This would typically open device settings
//     console.log('Opening location settings...');
//   }

//   // Validate and geocode address
//   async validateAndGeocodeAddress(address) {
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
//   async getSavedAddresses() {
//     // Mock implementation - in real app this would fetch from storage/API
//     return [];
//   }

//   // Check if location is in delivery area
//   isLocationInDeliveryArea(coordinates) {
//     // Mock implementation - in real app this would check against delivery zones
//     return {
//       isValid: true,
//       area: 'Mock Area'
//     };
//   }
// }

// export default new LocationService();
