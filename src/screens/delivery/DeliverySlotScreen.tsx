import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeliverySlot } from '../../../lib/types/delivery';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

// Mock delivery slots data
const MOCK_DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'slot1',
    date: '2025-06-26',
    time: '09:00-11:00',
    type: 'morning',
    capacity: 20,
    bookedCount: 5,
    available: true,
    charge: 0,
    estimatedDelivery: '2025-06-26T11:00:00Z',
  },
  {
    id: 'slot2',
    date: '2025-06-26',
    time: '14:00-16:00',
    type: 'evening',
    capacity: 20,
    bookedCount: 12,
    available: true,
    charge: 5.00,
    estimatedDelivery: '2025-06-26T16:00:00Z',
  },
  {
    id: 'slot3',
    date: '2025-06-26',
    time: '18:00-20:00',
    type: 'evening',
    capacity: 15,
    bookedCount: 15,
    available: false,
    charge: 10.00,
    estimatedDelivery: '2025-06-26T20:00:00Z',
  },
  {
    id: 'slot4',
    date: '2025-06-27',
    time: '09:00-11:00',
    type: 'morning',
    capacity: 20,
    bookedCount: 3,
    available: true,
    charge: 0,
    estimatedDelivery: '2025-06-27T11:00:00Z',
  },
  {
    id: 'slot5',
    date: '2025-06-27',
    time: '14:00-16:00',
    type: 'evening',
    capacity: 20,
    bookedCount: 8,
    available: true,
    charge: 5.00,
    estimatedDelivery: '2025-06-27T16:00:00Z',
  },
  {
    id: 'slot6',
    date: '2025-06-28',
    time: '10:00-12:00',
    type: 'express',
    capacity: 10,
    bookedCount: 2,
    available: true,
    charge: 15.00,
    estimatedDelivery: '2025-06-28T12:00:00Z',
  },
];

const DATES = [
  { date: '2025-06-26', label: 'Today' },
  { date: '2025-06-27', label: 'Tomorrow' },
  { date: '2025-06-28', label: 'Thu, 28 Jun' },
  { date: '2025-06-29', label: 'Fri, 29 Jun' },
  { date: '2025-06-30', label: 'Sat, 30 Jun' },
];

export const DeliverySlotScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [selectedDate, setSelectedDate] = useState('2025-06-26');
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSlotsForDate(selectedDate);
  }, [selectedDate]);

  const loadSlotsForDate = async (date: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const slotsForDate = MOCK_DELIVERY_SLOTS.filter(slot => slot.date === date);
      setAvailableSlots(slotsForDate);
    } catch (error) {
      Alert.alert('Error', 'Failed to load delivery slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: DeliverySlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    } else {
      Alert.alert('Slot Unavailable', 'This delivery slot is fully booked.');
    }
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a delivery slot to continue.');
      return;
    }

    Alert.alert(
      'Slot Selected',
      `Selected: ${selectedSlot.time} on ${formatDate(selectedSlot.date)}\nDelivery charge: AED ${selectedSlot.charge.toFixed(2)}`,
      [
        { text: 'Change', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Navigate to next screen (e.g., checkout or delivery instructions)
            navigation.goBack();
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSlotTypeLabel = (type: DeliverySlot['type']): string => {
    switch (type) {
      case 'morning':
        return 'Morning Delivery';
      case 'evening':
        return 'Evening Delivery';
      case 'express':
        return 'Express Delivery';
      default:
        return 'Standard Delivery';
    }
  };

  const getSlotTypeColor = (type: DeliverySlot['type']): string => {
    switch (type) {
      case 'morning':
        return '#FFA500';
      case 'evening':
        return '#4169E1';
      case 'express':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const renderDateTab = ({ item }: { item: typeof DATES[0] }) => (
    <TouchableOpacity
      style={[
        styles.dateTab,
        selectedDate === item.date && styles.selectedDateTab,
      ]}
      onPress={() => handleDateSelect(item.date)}
    >
      <Text
        style={[
          styles.dateTabText,
          selectedDate === item.date && styles.selectedDateTabText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSlot = ({ item }: { item: DeliverySlot }) => (
    <TouchableOpacity
      style={[
        styles.slotCard,
        !item.available && styles.unavailableSlot,
        selectedSlot?.id === item.id && styles.selectedSlot,
      ]}
      onPress={() => handleSlotSelect(item)}
      disabled={!item.available}
    >
      <View style={styles.slotHeader}>
        <View style={styles.slotInfo}>
          <Text style={styles.slotTime}>{item.time}</Text>
          <View
            style={[
              styles.typeTag,
              { backgroundColor: getSlotTypeColor(item.type) },
            ]}
          >
            <Text style={styles.typeText}>{getSlotTypeLabel(item.type)}</Text>
          </View>
        </View>
        <View style={styles.slotPrice}>
          <Text style={styles.priceText}>
            {item.charge === 0 ? 'FREE' : `AED ${item.charge.toFixed(2)}`}
          </Text>
        </View>
      </View>

      <View style={styles.slotFooter}>
        <View style={styles.capacityInfo}>
          <Text style={styles.capacityText}>
            {item.capacity - item.bookedCount} slots left
          </Text>
        </View>
        {!item.available && (
          <Text style={styles.unavailableText}>Fully Booked</Text>
        )}
        {selectedSlot?.id === item.id && (
          <Text style={styles.selectedText}>✓ Selected</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading delivery slots..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Slot</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <FlatList
            data={DATES}
            renderItem={renderDateTab}
            keyExtractor={(item) => item.date}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          />
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Slots for {formatDate(selectedDate)}
          </Text>
          {availableSlots.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No delivery slots available for this date.
              </Text>
              <Text style={styles.emptySubtext}>
                Please select a different date.
              </Text>
            </Card>
          ) : (
            <FlatList
              data={availableSlots}
              renderItem={renderSlot}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Delivery Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Delivery Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>• Morning Delivery:</Text>
            <Text style={styles.infoValue}>FREE (9 AM - 11 AM)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>• Evening Delivery:</Text>
            <Text style={styles.infoValue}>AED 5.00 (2 PM - 8 PM)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>• Express Delivery:</Text>
            <Text style={styles.infoValue}>AED 15.00 (Same day)</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={selectedSlot ? `Continue (${selectedSlot.time})` : 'Select a Slot'}
          onPress={handleContinue}
          disabled={!selectedSlot}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 2,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  dateList: {
    paddingVertical: 5,
  },
  dateTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDateTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedDateTabText: {
    color: 'white',
  },
  slotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSlot: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  unavailableSlot: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotInfo: {
    flex: 1,
  },
  slotTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  slotPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityInfo: {
    flex: 1,
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
  },
  unavailableText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  selectedText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    margin: 20,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    marginTop: 0,
  },
});

// Default export to satisfy Expo Router (this file should be treated as a route)
export default DeliverySlotScreen;

