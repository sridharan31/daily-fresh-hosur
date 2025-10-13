 // app/components/delivery/TimeSlotGrid.tsx
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DeliverySlot } from '../../../lib/types/delivery';

interface TimeSlotGridProps {
  slots: DeliverySlot[];
  selectedSlot?: DeliverySlot | null;
  onSlotSelect: (slot: DeliverySlot) => void;
  numColumns?: number;
  style?: ViewStyle;
  testID?: string;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  numColumns = 2,
  style,
  testID,
}) => {
  const renderSlotItem = ({item}: {item: DeliverySlot}) => {
    const isSelected = selectedSlot?.id === item.id;
    const isAvailable = item.available && item.bookedCount < item.capacity;
    const utilization = (item.bookedCount / item.capacity) * 100;

    const getSlotStyle = () => {
      if (!isAvailable) return styles.unavailableSlot;
      if (isSelected) return styles.selectedSlot;
      if (utilization > 80) return styles.almostFullSlot;
      return styles.availableSlot;
    };

    const getSlotTextStyle = () => {
      if (!isAvailable) return styles.unavailableText;
      if (isSelected) return styles.selectedText;
      return styles.availableText;
    };

    const getSlotIcon = () => {
      if (!isAvailable) return 'block';
      if (item.type === 'express') return 'flash-on';
      if (item.type === 'morning') return 'wb-sunny';
      if (item.type === 'evening') return 'nights-stay';
      return 'schedule';
    };

    const getSlotTypeLabel = () => {
      switch (item.type) {
        case 'express':
          return 'Express';
        case 'morning':
          return 'Morning';
        case 'evening':
          return 'Evening';
        default:
          return 'Standard';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.slotItem, getSlotStyle()]}
        onPress={() => isAvailable && onSlotSelect(item)}
        disabled={!isAvailable}
        testID={`${testID}-slot-${item.id}`}
      >
        <View style={styles.slotHeader}>
          <Icon 
            name={getSlotIcon()} 
            size={20} 
            color={getSlotTextStyle().color} 
          />
          <Text style={[styles.slotType, getSlotTextStyle()]}>
            {getSlotTypeLabel()}
          </Text>
        </View>

        <Text style={[styles.slotTime, getSlotTextStyle()]}>
          {item.time}
        </Text>

        <View style={styles.slotDetails}>
          <Text style={[styles.slotCapacity, getSlotTextStyle()]}>
            {item.capacity - item.bookedCount} slots left
          </Text>
          
          {item.charge > 0 && (
            <Text style={[styles.slotCharge, getSlotTextStyle()]}>
              +₹{item.charge}
            </Text>
          )}
        </View>

        {item.type === 'express' && (
          <View style={styles.expressBadge}>
            <Text style={styles.expressText}>FAST</Text>
          </View>
        )}

        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>FULL</Text>
          </View>
        )}

        {utilization > 80 && isAvailable && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <FlatList
        data={slots}
        renderItem={renderSlotItem}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        testID={`${testID}-grid`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  slotItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 120,
    position: 'relative',
  },
  // Slot states
  availableSlot: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  selectedSlot: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  almostFullSlot: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  slotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotCapacity: {
    fontSize: 12,
    opacity: 0.8,
  },
  slotCharge: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Text styles
  availableText: {
    color: '#333',
  },
  selectedText: {
    color: '#2E7D32',
  },
  unavailableText: {
    color: '#999',
  },
  // Badges
  expressBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
  },
  expressText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default TimeSlotGrid;
