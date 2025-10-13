// app/services/business/deliveryCalculator.ts
import { LocationCoordinates } from '../../types/delivery';

export interface DeliveryEstimate {
  isDeliveryAvailable: boolean;
  deliveryCharge: number;
  estimatedTime: number; // in minutes
  distance: number; // in kilometers
  serviceFee: number;
  message?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  coordinates: LocationCoordinates[];
  baseCharge: number;
  freeDeliveryThreshold: number;
  maxDistance: number;
  estimatedTime: number;
  isActive: boolean;
}

class DeliveryCalculatorService {
  private deliveryZones: DeliveryZone[] = [
    {
      id: 'zone-1',
      name: 'Central Area',
      coordinates: [], // Would contain polygon coordinates
      baseCharge: 3.99,
      freeDeliveryThreshold: 50,
      maxDistance: 10,
      estimatedTime: 30,
      isActive: true,
    },
    {
      id: 'zone-2',
      name: 'Extended Area',
      coordinates: [],
      baseCharge: 5.99,
      freeDeliveryThreshold: 75,
      maxDistance: 20,
      estimatedTime: 45,
      isActive: true,
    },
  ];

  /**
   * Calculate delivery estimate based on location and order value
   */
  async getDeliveryEstimate(
    deliveryLocation: LocationCoordinates,
    orderValue: number
  ): Promise<DeliveryEstimate> {
    try {
      // Find the delivery zone for the location
      const zone = await this.findDeliveryZone(deliveryLocation);
      
      if (!zone) {
        return {
          isDeliveryAvailable: false,
          deliveryCharge: 0,
          estimatedTime: 0,
          distance: 0,
          serviceFee: 0,
          message: 'Delivery not available in your area',
        };
      }

      // Calculate distance (simplified - in real app would use mapping API)
      const distance = this.calculateDistance(deliveryLocation);
      
      if (distance > zone.maxDistance) {
        return {
          isDeliveryAvailable: false,
          deliveryCharge: 0,
          estimatedTime: 0,
          distance,
          serviceFee: 0,
          message: 'Location is outside delivery area',
        };
      }

      // Calculate delivery charge
      let deliveryCharge = zone.baseCharge;
      
      // Apply distance-based pricing
      if (distance > 5) {
        deliveryCharge += (distance - 5) * 0.5;
      }

      // Apply free delivery threshold
      if (orderValue >= zone.freeDeliveryThreshold) {
        deliveryCharge = 0;
      }

      // Calculate estimated time
      const estimatedTime = zone.estimatedTime + Math.floor(distance * 2);

      // Service fee (2% of order value, max $2)
      const serviceFee = Math.min(orderValue * 0.02, 2);

      return {
        isDeliveryAvailable: true,
        deliveryCharge: Number(deliveryCharge.toFixed(2)),
        estimatedTime,
        distance: Number(distance.toFixed(2)),
        serviceFee: Number(serviceFee.toFixed(2)),
      };
    } catch (error) {
      console.error('Error calculating delivery estimate:', error);
      return {
        isDeliveryAvailable: false,
        deliveryCharge: 0,
        estimatedTime: 0,
        distance: 0,
        serviceFee: 0,
        message: 'Unable to calculate delivery estimate',
      };
    }
  }

  /**
   * Find delivery zone for given coordinates
   */
  private async findDeliveryZone(location: LocationCoordinates): Promise<DeliveryZone | null> {
    // In a real app, this would check if the location is within any delivery zone polygon
    // For now, we'll use a simple distance-based approach
    
    const activeZones = this.deliveryZones.filter(zone => zone.isActive);
    
    if (activeZones.length === 0) {
      return null;
    }

    // For simplicity, return the first active zone
    // In reality, you'd check point-in-polygon for each zone
    return activeZones[0];
  }

  /**
   * Calculate distance between two coordinates (simplified)
   */
  private calculateDistance(location: LocationCoordinates): number {
    // Simplified calculation - in real app would use proper geolocation calculation
    // For now, return a random distance between 1-15 km
    return Math.random() * 14 + 1;
  }

  /**
   * Get available delivery zones
   */
  getDeliveryZones(): DeliveryZone[] {
    return this.deliveryZones.filter(zone => zone.isActive);
  }

  /**
   * Check if delivery is available at location
   */
  async isDeliveryAvailable(location: LocationCoordinates): Promise<boolean> {
    const estimate = await this.getDeliveryEstimate(location, 0);
    return estimate.isDeliveryAvailable;
  }

  /**
   * Get delivery time estimate
   */
  async getDeliveryTimeEstimate(location: LocationCoordinates): Promise<number> {
    const estimate = await this.getDeliveryEstimate(location, 0);
    return estimate.estimatedTime;
  }

  /**
   * Update delivery zones (admin function)
   */
  updateDeliveryZones(zones: DeliveryZone[]): void {
    this.deliveryZones = zones;
  }
}

// Export singleton instance
const deliveryCalculator = new DeliveryCalculatorService();
export default deliveryCalculator;
