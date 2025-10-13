// app/components/delivery/DeliveryMap.web.tsx
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
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

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  deliveryAddress,
  order,
  showRoute = false,
  showTracking = false,
  onLocationPress,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.placeholderTitle}>Map View</Text>
        <Text style={styles.placeholderText}>
          Maps are not available in web version.
        </Text>
        <Text style={styles.placeholderText}>
          Please use the mobile app for full map functionality.
        </Text>
        {deliveryAddress && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressTitle}>Delivery Address:</Text>
            <Text style={styles.addressText}>
              {deliveryAddress.street}, {deliveryAddress.city}
            </Text>
            {deliveryAddress.emirate && (
              <Text style={styles.addressText}>{deliveryAddress.emirate}</Text>
            )}
          </View>
        )}
        {order && (
          <View style={styles.orderContainer}>
            <Text style={styles.orderTitle}>Order #{order.id}</Text>
            <Text style={styles.orderText}>Status: {order.status}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    margin: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#b3d9e8',
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#5a7ba7',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  addressContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 250,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcc02',
    minWidth: 250,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
  },
});

export default DeliveryMap;
