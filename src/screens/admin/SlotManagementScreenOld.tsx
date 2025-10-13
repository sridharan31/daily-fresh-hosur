 
// src/screens/admin/SlotManagementScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import {
    createDeliverySlot,
    deleteDeliverySlot,
    fetchDeliverySlots,
    getSlotUtilization,
    updateDeliverySlot,
} from '../../../lib/store/slices/adminSlice';
import { DeliverySlot } from '../../../lib/types/delivery';

interface SlotFormData {
  date: string;
  timeFrom: string;
  timeTo: string;
  capacity: string;
  price: string;
  type: 'morning' | 'evening' | 'express';
  area: string;
  isActive: boolean;
}

const SlotManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliverySlots, deliverySlotsLoading } = useSelector((state: RootState) => state.admin);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [utilization, setUtilization] = useState<{ slotId: string; utilization: number }[]>([]);
  
  const [formData, setFormData] = useState<SlotFormData>({
    date: new Date().toISOString().split('T')[0],
    timeFrom: '09:00',
    timeTo: '12:00',
    capacity: '50',
    price: '0',
    type: 'morning',
    area: 'all',
    isActive: true,
  });

  useEffect(() => {
    loadSlots();
    loadUtilization();
  }, [selectedDate]);

  const loadSlots = useCallback(() => {
    dispatch(fetchDeliverySlots({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  const loadUtilization = useCallback(async () => {
    try {
      const result = await dispatch(getSlotUtilization({ dateRange: selectedDate }));
      if (result.payload) {
        setUtilization(result.payload);
      }
    } catch (error) {
      console.error('Failed to load utilization:', error);
    }
  }, [dispatch, selectedDate]);

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      timeFrom: '09:00',
      timeTo: '12:00',
      capacity: '50',
      price: '0',
      type: 'morning',
      area: 'all',
      isActive: true,
    });
  };

  const handleAddSlot = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditSlot = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
    setFormData({
      date: slot.date,
      timeFrom: slot.time.split(' - ')[0] || '09:00',
      timeTo: slot.time.split(' - ')[1] || '12:00',
      capacity: slot.capacity.toString(),
      price: slot.charge.toString(),
      type: slot.type,
      area: 'all', // Default since area isn't in the interface
      isActive: slot.available,
    });
    setShowEditModal(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this delivery slot?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteDeliverySlot(slotId)),
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.timeFrom || !formData.timeTo || !formData.capacity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const slotData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      price: parseFloat(formData.price),
    };

    try {
      if (selectedSlot) {
        await dispatch(updateDeliverySlot({id: selectedSlot.id, data: slotData}));
        setShowEditModal(false);
      } else {
        await dispatch(createDeliverySlot(slotData));
        setShowAddModal(false);
      }
      resetForm();
      setSelectedSlot(null);
      loadSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to save delivery slot');
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return '#F44336';
    if (utilization >= 70) return '#FF9800';
    if (utilization >= 50) return '#4CAF50';
    return '#2196F3';
  };

  const renderSlotCard = (slot: DeliverySlot) => {
    const utilization = (slot.booked / slot.capacity) * 100;
    const utilizationColor = getUtilizationColor(utilization);

    return (
      <View key={slot.id} style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <View style={styles.slotType}>
            <Text style={[styles.slotTypeText, {color: utilizationColor}]}>
              {slot.type.toUpperCase()}
            </Text>
            {!slot.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
              </View>
            )}
          </View>
          <View style={styles.slotActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditSlot(slot)}
            >
              <Icon name="edit" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSlot(slot.id)}
            >
              <Icon name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.slotInfo}>
          <Text style={styles.slotTime}>
            {slot.timeFrom} - {slot.timeTo}
          </Text>
          {slot.price > 0 && (
            <Text style={styles.slotPrice}>₹{slot.price}</Text>
          )}
        </View>

        <View style={styles.capacityInfo}>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                {
                  width: `${utilization}%`,
                  backgroundColor: utilizationColor,
                },
              ]}
            />
          </View>
          <Text style={styles.capacityText}>
            {slot.booked}/{slot.capacity} ({utilization.toFixed(0)}%)
          </Text>
        </View>

        <Text style={styles.slotArea}>Area: {slot.area}</Text>
      </View>
    );
  };

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      onRequestClose={() => {
        isEdit ? setShowEditModal(false) : setShowAddModal(false);
        resetForm();
        setSelectedSlot(null);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isEdit ? 'Edit Delivery Slot' : 'Add New Delivery Slot'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              isEdit ? setShowEditModal(false) : setShowAddModal(false);
              resetForm();
              setSelectedSlot(null);
            }}
          >
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({...prev, date: text}))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>From Time</Text>
              <TextInput
                style={styles.input}
                value={formData.timeFrom}
                onChangeText={(text) => setFormData(prev => ({...prev, timeFrom: text}))}
                placeholder="HH:MM"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>To Time</Text>
              <TextInput
                style={styles.input}
                value={formData.timeTo}
                onChangeText={(text) => setFormData(prev => ({...prev, timeTo: text}))}
                placeholder="HH:MM"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.input}
                value={formData.capacity}
                onChangeText={(text) => setFormData(prev => ({...prev, capacity: text}))}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({...prev, price: text}))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Slot Type</Text>
            <View style={styles.typeSelector}>
              {['morning', 'evening', 'express'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    formData.type === type && styles.selectedTypeOption,
                  ]}
                  onPress={() => setFormData(prev => ({...prev, type: type as any}))}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === type && styles.selectedTypeOptionText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Delivery Area</Text>
            <TextInput
              style={styles.input}
              value={formData.area}
              onChangeText={(text) => setFormData(prev => ({...prev, area: text}))}
              placeholder="all, north, south, east, west"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active Slot</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData(prev => ({...prev, isActive: value}))}
                trackColor={{false: '#f0f0f0', true: '#4CAF50'}}
                thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              isEdit ? setShowEditModal(false) : setShowAddModal(false);
              resetForm();
              setSelectedSlot(null);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Update' : 'Create'} Slot
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const todaySlots = deliverySlots.filter((slot: DeliverySlot) => slot.date === selectedDate);
  const morningSlots = todaySlots.filter((slot: DeliverySlot) => slot.type === 'morning');
  const eveningSlots = todaySlots.filter((slot: DeliverySlot) => slot.type === 'evening');
  const expressSlots = todaySlots.filter((slot: DeliverySlot) => slot.type === 'express');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Slot Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSlot}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#4CAF50',
            },
          }}
          theme={{
            selectedDayBackgroundColor: '#4CAF50',
            todayTextColor: '#4CAF50',
            arrowColor: '#4CAF50',
          }}
        />
      </View>

      {/* Overall Statistics */}
      {slotUtilization && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>
            Utilization for {new Date(selectedDate).toLocaleDateString()}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{slotUtilization.totalSlots}</Text>
              <Text style={styles.statLabel}>Total Slots</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{slotUtilization.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {((slotUtilization.totalBookings / slotUtilization.totalCapacity) * 100).toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Utilization</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.slotsContainer}>
        {/* Morning Slots */}
        {morningSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Morning Slots (6 AM - 12 PM)</Text>
            {morningSlots.map(renderSlotCard)}
          </View>
        )}

        {/* Evening Slots */}
        {eveningSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Evening Slots (2 PM - 8 PM)</Text>
            {eveningSlots.map(renderSlotCard)}
          </View>
        )}

        {/* Express Slots */}
        {expressSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Express Slots (Same Day)</Text>
            {expressSlots.map(renderSlotCard)}
          </View>
        )}

        {todaySlots.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="schedule" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No slots configured for this date</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddSlot}>
              <Text style={styles.emptyButtonText}>Add First Slot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Slot Modal */}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
};

// Default export to satisfy Expo Router (this file should be treated as a route)
export default SlotManagementScreen;