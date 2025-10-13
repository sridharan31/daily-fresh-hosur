// app/components/delivery/SlotPicker.tsx
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { fetchDeliverySlots, setSelectedSlot } from '../../../lib/store/slices/deliverySlice';
import { DeliverySlot } from '../../../lib/types/delivery';
import SlotCalendar from './SlotCalendar';
import TimeSlotGrid from './TimeSlotGrid';

interface SlotPickerProps {
  onSlotSelected: (slot: DeliverySlot) => void;
  style?: ViewStyle;
  testID?: string;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ onSlotSelected, style, testID }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Handle persisted state safely
  const deliveryState = useSelector((state: RootState) => {
    try {
      return (state as any).delivery || { deliverySlots: [], selectedSlot: null, loading: false };
    } catch {
      return { deliverySlots: [], selectedSlot: null, loading: false };
    }
  });
  
  const authState = useSelector((state: RootState) => {
    try {
      return (state as any).auth || { user: null };
    } catch {
      return { user: null };
    }
  });
  
  const { deliverySlots, selectedSlot, loading } = deliveryState;
  const { user } = authState;
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<DeliverySlot | null>(null);

  // Group slots by time period
  const availableSlots = deliverySlots.reduce((acc: any, slot: DeliverySlot) => {
    const hour = parseInt(slot.time.split(':')[0]);
    let period = 'evening';
    
    if (hour >= 6 && hour < 12) {
      period = 'morning';
    } else if (slot.type === 'express') {
      period = 'express';
    }
    
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(slot);
    return acc;
  }, {});

  useEffect(() => {
    if (selectedDate && user?.address?.coordinates) {
      dispatch(fetchDeliverySlots({
        date: selectedDate,
        addressId: user.address.id,
      }));
    }
  }, [selectedDate, user?.address?.coordinates, dispatch]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: DeliverySlot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
      dispatch(setSelectedSlot(slot));
      
      if (onSlotSelected) {
        onSlotSelected(slot);
      }
    } else {
      Alert.alert('Slot Unavailable', 'This slot is fully booked. Please select another slot.');
    }
  };

  const renderSlotType = (type: string, slots: DeliverySlot[]) => {
    return (
      <View style={styles.slotTypeContainer}>
        <Text style={styles.slotTypeTitle}>{type}</Text>
        <TimeSlotGrid
          slots={slots}
          selectedSlot={selectedTimeSlot}
          onSlotSelect={handleTimeSlotSelect}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Delivery Slot</Text>
      
      {/* Calendar */}
      <SlotCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        minDate={new Date()}
        maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days ahead
      />

      {/* Time Slots */}
      <ScrollView style={styles.slotsContainer}>
        {availableSlots?.morning?.length > 0 && 
          renderSlotType('Morning (6 AM - 12 PM)', availableSlots.morning)
        }
        
        {availableSlots?.evening?.length > 0 && 
          renderSlotType('Evening (2 PM - 8 PM)', availableSlots.evening)
        }
        
        {availableSlots?.express?.length > 0 && 
          renderSlotType('Express Delivery (Same Day)', availableSlots.express)
        }

        {(!availableSlots || Object.keys(availableSlots).length === 0) && (
          <View style={styles.noSlotsContainer}>
            <Icon name="event-busy" size={48} color="#ccc" />
            <Text style={styles.noSlotsText}>
              No delivery slots available for this date
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Selected Slot Summary */}
      {selectedTimeSlot && (
        <View style={styles.selectedSlotContainer}>
          <Text style={styles.selectedSlotTitle}>Selected Slot:</Text>
          <Text style={styles.selectedSlotText}>
            {new Date(selectedDate).toDateString()} • {selectedTimeSlot.time}
          </Text>
          {selectedTimeSlot.charge > 0 && (
            <Text style={styles.slotCharge}>
              Delivery Charge: ₹{selectedTimeSlot.charge}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  slotsContainer: {
    flex: 1,
    marginTop: 16,
  },
  slotTypeContainer: {
    marginBottom: 24,
  },
  slotTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4CAF50',
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  selectedSlotContainer: {
    backgroundColor: '#f0f8f0',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedSlotTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  selectedSlotText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  slotCharge: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default SlotPicker;
