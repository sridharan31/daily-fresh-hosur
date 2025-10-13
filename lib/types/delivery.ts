 export interface DeliverySlot {
  id: string;
  date: string;
  time: string;
  type: 'morning' | 'evening' | 'express';
  capacity: number;
  bookedCount: number;
  available: boolean;
  charge: number;
  estimatedDelivery: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  pincode: string;
  isActive: boolean;
  deliveryCharge: number;
  minimumOrderValue: number;
}

export interface DeliveryAddress {
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

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  isActive: boolean;
  deliveryCharges: {
    standard: number;
    express: number;
  };
}

export interface DeliveryState {
  availableSlots: DeliverySlot[];
  addresses: DeliveryAddress[];
  selectedSlot: DeliverySlot | null;
  selectedAddress: DeliveryAddress | null;
  selectedDate: string | null;
  deliveryAreas: DeliveryArea[];
  deliveryZones: DeliveryZone[];
  isLoading: boolean;
  loading: boolean;
  slotsLoading: boolean;
  error: string | null;
  addressValidation: {
    isValid: boolean;
    zone?: DeliveryZone;
    message?: string;
  } | null;
  estimatedDeliveryTime: string | null;
  deliveryCharge: number;
}

