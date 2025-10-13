// app/components/delivery/DeliveryMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Address } from '../../../lib/types/auth';
import { Order } from '../../../lib/types/order';

const {width, height} = Dimensions.get('window');

interface DeliveryMapProps {
  deliveryAddress: Address;
  order?: Order;
  showRoute?: boolean;
  showTracking?: boolean;
  onLocationPress?: (coordinate: {latitude: number; longitude: number}) => void;
  testID?: string;
}

interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  deliveryAddress,
  order,
  showRoute = false,
  showTracking = false,
  onLocationPress,
  testID,
}) => {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinate | null>(null);
  const [deliveryPersonLocation, setDeliveryPersonLocation] = useState<LocationCoordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LocationCoordinate[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const storeLocation: LocationCoordinate = {
    latitude: 25.2048, // Abu Dhabi store location
    longitude: 55.2708,
  };

  const deliveryLocation: LocationCoordinate = {
    latitude: deliveryAddress.coordinates?.latitude || 25.2048,
    longitude: deliveryAddress.coordinates?.longitude || 55.2708,
  };

  useEffect(() => {
    getCurrentLocation();
    if (showTracking && order?.status === 'out_for_delivery') {
      startTrackingDelivery();
    }
  }, [showTracking, order?.status]);

  useEffect(() => {
    if (mapReady && showRoute) {
      fitMapToCoordinates();
    }
  }, [mapReady, showRoute, routeCoordinates]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      (error) => {
        console.warn('Error getting location:', error);
        Alert.alert('Location Error', 'Could not get your current location');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
    );
  };

  const startTrackingDelivery = () => {
    // Simulate delivery person location updates
    // In a real app, this would come from your backend
    const simulateMovement = () => {
      const mockLocation = {
        latitude: storeLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: storeLocation.longitude + (Math.random() - 0.5) * 0.01,
      };
      setDeliveryPersonLocation(mockLocation);
    };

    const interval = setInterval(simulateMovement, 5000);
    return () => clearInterval(interval);
  };

  const fitMapToCoordinates = () => {
    if (!mapRef.current) return;

    const coordinates = [
      storeLocation,
      deliveryLocation,
      ...(currentLocation ? [currentLocation] : []),
      ...(deliveryPersonLocation ? [deliveryPersonLocation] : []),
    ];

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
      animated: true,
    });
  };

  const handleMapPress = (event: any) => {
    if (onLocationPress) {
      const {latitude, longitude} = event.nativeEvent.coordinate;
      onLocationPress({latitude, longitude});
    }
  };

  const centerOnDeliveryLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...deliveryLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const centerOnCurrentLocation = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...deliveryLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onMapReady={() => setMapReady(true)}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        testID={`${testID}-map`}
      >
        {/* Store Location */}
        <Marker
          coordinate={storeLocation}
          title="Store Location"
          description="Fresh Grocery Store"
          testID={`${testID}-store-marker`}
        >
          <View style={styles.storeMarker}>
            <Icon name="store" size={24} color="#fff" />
          </View>
        </Marker>

        {/* Delivery Location */}
        <Marker
          coordinate={deliveryLocation}
          title="Delivery Address"
          description={`${deliveryAddress.street}, ${deliveryAddress.city}`}
          testID={`${testID}-delivery-marker`}
        >
          <View style={styles.deliveryMarker}>
            <Icon name="home" size={24} color="#fff" />
          </View>
        </Marker>

        {/* Delivery Person Location */}
        {deliveryPersonLocation && showTracking && (
          <Marker
            coordinate={deliveryPersonLocation}
            title="Delivery Person"
            description="Your order is on the way!"
            testID={`${testID}-delivery-person-marker`}
          >
            <View style={styles.deliveryPersonMarker}>
              <Icon name="delivery-dining" size={24} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4CAF50"
            strokeWidth={3}
            testID={`${testID}-route`}
          />
        )}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnDeliveryLocation}
          testID={`${testID}-center-delivery`}
        >
          <Icon name="home" size={20} color="#4CAF50" />
        </TouchableOpacity>

        {currentLocation && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnCurrentLocation}
            testID={`${testID}-center-current`}
          >
            <Icon name="my-location" size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.controlButton}
          onPress={fitMapToCoordinates}
          testID={`${testID}-fit-all`}
        >
          <Icon name="zoom-out-map" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Delivery Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Delivery Address</Text>
        <Text style={styles.infoAddress}>
          {deliveryAddress.street}, {deliveryAddress.city}
        </Text>
        {deliveryAddress.landmark && (
          <Text style={styles.infoLandmark}>
            Near: {deliveryAddress.landmark}
          </Text>
        )}
        {order && (
          <Text style={styles.infoStatus}>
            Status: {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  storeMarker: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryPersonMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoLandmark: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  infoStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginTop: 8,
  },
});

export default DeliveryMap; 
