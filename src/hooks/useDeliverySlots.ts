 // app/hooks/useDeliverySlots.ts
import { useCallback, useEffect, useState } from 'react';
import deliveryService from '../../lib/services/api/deliveryService';
import { DeliveryAddress, DeliveryArea, DeliverySlot } from '../../lib/types/delivery';
import { useLocation } from './useLocation';

interface DeliverySlotState {
  availableSlots: {
    morning: DeliverySlot[];
    evening: DeliverySlot[];
    express: DeliverySlot[];
  };
  selectedSlot: DeliverySlot | null;
  selectedDate: string | null;
  deliveryAreas: DeliveryArea[];
  deliveryCharges: {
    standard: number;
    express: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface UseDeliverySlotsReturn extends DeliverySlotState {
  // Slot management
  fetchAvailableSlots: (date: string, area?: string) => Promise<void>;
  selectSlot: (slot: DeliverySlot, date: string) => void;
  clearSelection: () => void;
  refreshSlots: () => Promise<void>;
  
  // Booking
  bookSlot: (slot: DeliverySlot, address: DeliveryAddress, instructions?: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  
  // Availability checking
  checkSlotAvailability: (slotId: string, date: string) => Promise<boolean>;
  getSlotCapacity: (slotId: string, date: string) => Promise<number>;
  isSlotBookable: (slot: DeliverySlot) => boolean;
  
  // Delivery areas
  loadDeliveryAreas: () => Promise<void>;
  findDeliveryArea: (address: DeliveryAddress) => DeliveryArea | null;
  isAreaServiceable: (address: DeliveryAddress) => boolean;
  
  // Pricing
  calculateDeliveryCharge: (slot: DeliverySlot, address: DeliveryAddress) => number;
  getEstimatedDeliveryTime: (slot: DeliverySlot, address: DeliveryAddress) => string;
  
  // Utility methods
  getNextAvailableSlot: () => DeliverySlot | null;
  getSlotsForDate: (date: string) => DeliverySlot[];
  isDateAvailable: (date: string) => boolean;
  clearError: () => void;
}

export const useDeliverySlots = (): UseDeliverySlotsReturn => {
  const [state, setState] = useState<DeliverySlotState>({
    availableSlots: {
      morning: [],
      evening: [],
      express: [],
    },
    selectedSlot: null,
    selectedDate: null,
    deliveryAreas: [],
    deliveryCharges: {
      standard: 5,
      express: 15,
    },
    isLoading: false,
    error: null,
  });

  const { savedAddresses } = useLocation();
  
  // Get the primary address (first saved address) or null
  const selectedAddress: DeliveryAddress | null = savedAddresses.length > 0 ? savedAddresses[0] : null;

  useEffect(() => {
    loadDeliveryAreas();
  }, []);

  useEffect(() => {
    if (selectedAddress && state.selectedDate) {
      fetchAvailableSlots(state.selectedDate, selectedAddress.area);
    }
  }, [selectedAddress, state.selectedDate]);

  const fetchAvailableSlots = useCallback(async (date: string, area?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const areaToUse = area || selectedAddress?.area;
      if (!areaToUse) {
        throw new Error('No delivery area specified');
      }
      
      const response = await deliveryService.getAvailableSlots(date, areaToUse);
      const slots: DeliverySlot[] = response.data || [];
      
      // Group slots by type
      const groupedSlots = {
        morning: slots.filter((slot: DeliverySlot) => slot.type === 'morning'),
        evening: slots.filter((slot: DeliverySlot) => slot.type === 'evening'),
        express: slots.filter((slot: DeliverySlot) => slot.type === 'express'),
      };
      
      setState(prev => ({ 
        ...prev, 
        availableSlots: groupedSlots,
        selectedDate: date,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to fetch delivery slots',
        isLoading: false,
      }));
    }
  }, [selectedAddress]);

  const selectSlot = useCallback((slot: DeliverySlot, date: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedSlot: slot,
      selectedDate: date,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      selectedSlot: null,
      selectedDate: null,
    }));
  }, []);

  const refreshSlots = useCallback(async () => {
    if (state.selectedDate) {
      await fetchAvailableSlots(state.selectedDate);
    }
  }, [state.selectedDate, fetchAvailableSlots]);

  const bookSlot = useCallback(async (slot: DeliverySlot, address: DeliveryAddress, instructions?: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const bookingData = {
        slotId: slot.id,
        date: state.selectedDate!,
        address,
        instructions,
        charge: calculateDeliveryCharge(slot, address),
      };
      
      await deliveryService.bookSlot(bookingData);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to book delivery slot',
        isLoading: false,
      }));
      return false;
    }
  }, [state.selectedDate]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await deliveryService.cancelBooking(bookingId);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response.success || true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to cancel booking',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const checkSlotAvailability = useCallback(async (slotId: string, date: string): Promise<boolean> => {
    try {
      const response = await deliveryService.checkSlotAvailability(slotId, date);
      return response.data?.isAvailable || false;
    } catch (error) {
      return false;
    }
  }, []);

  const getSlotCapacity = useCallback(async (slotId: string, date: string): Promise<number> => {
    try {
      const response = await deliveryService.getSlotCapacity(slotId, date);
      return response.data?.capacity || 0;
    } catch (error) {
      return 0;
    }
  }, []);

  const isSlotBookable = useCallback((slot: DeliverySlot): boolean => {
    return slot.available && slot.bookedCount < slot.capacity;
  }, []);

  const loadDeliveryAreas = useCallback(async () => {
    try {
      const response = await deliveryService.getDeliveryAreas();
      const areas: DeliveryArea[] = response.data || [];
      setState(prev => ({ ...prev, deliveryAreas: areas }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to load delivery areas',
      }));
    }
  }, []);

  const findDeliveryArea = useCallback((address: DeliveryAddress): DeliveryArea | null => {
    return state.deliveryAreas.find(area =>        area.pincode === address.pincode || area.name.toLowerCase() === address.area?.toLowerCase()
    ) || null;
  }, [state.deliveryAreas]);

  const isAreaServiceable = useCallback((address: DeliveryAddress): boolean => {
    const area = findDeliveryArea(address);
    return area?.isActive || false;
  }, [findDeliveryArea]);

  const calculateDeliveryCharge = useCallback((slot: DeliverySlot, address: DeliveryAddress): number => {
    const area = findDeliveryArea(address);
    const baseCharge = area?.deliveryCharge || 0;
    const slotCharge = slot.charge || 0;
    
    return baseCharge + slotCharge;
  }, [findDeliveryArea]);

  const getEstimatedDeliveryTime = useCallback((slot: DeliverySlot, address: DeliveryAddress): string => {
    // This would typically be calculated based on distance, traffic, etc.
    const baseTime = slot.type === 'express' ? 30 : 60; // minutes
    return `${baseTime}-${baseTime + 30} minutes`;
  }, []);

  const getNextAvailableSlot = useCallback((): DeliverySlot | null => {
    const allSlots = [
      ...state.availableSlots.morning,
      ...state.availableSlots.evening,
      ...state.availableSlots.express,
    ];
    
    return allSlots.find(slot => isSlotBookable(slot)) || null;
  }, [state.availableSlots, isSlotBookable]);

  const getSlotsForDate = useCallback((date: string): DeliverySlot[] => {
    if (date !== state.selectedDate) return [];
    
    return [
      ...state.availableSlots.morning,
      ...state.availableSlots.evening,
      ...state.availableSlots.express,
    ];
  }, [state.availableSlots, state.selectedDate]);

  const isDateAvailable = useCallback((date: string): boolean => {
    const dateObj = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7); // 7 days ahead
    
    return dateObj >= today && dateObj <= maxDate;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchAvailableSlots,
    selectSlot,
    clearSelection,
    refreshSlots,
    bookSlot,
    cancelBooking,
    checkSlotAvailability,
    getSlotCapacity,
    isSlotBookable,
    loadDeliveryAreas,
    findDeliveryArea,
    isAreaServiceable,
    calculateDeliveryCharge,
    getEstimatedDeliveryTime,
    getNextAvailableSlot,
    getSlotsForDate,
    isDateAvailable,
    clearError,
  };
};



// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
