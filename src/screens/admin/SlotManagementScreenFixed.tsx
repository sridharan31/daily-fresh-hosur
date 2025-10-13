// src/screens/admin/SlotManagementScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  charge: string;
  type: 'morning' | 'evening' | 'express';
  available: boolean;
}

const SlotManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliverySlots, deliverySlotsLoading } = useSelector((state: RootState) => state.admin);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [utilization, setUtilization] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState<SlotFormData>({
    date: new Date().toISOString().split('T')[0],
    timeFrom: '09:00',
    timeTo: '12:00',
    capacity: '50',
    charge: '0',
    type: 'morning',
    available: true,
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
      if (result.payload && Array.isArray(result.payload)) {
        const utilizationMap: { [key: string]: number } = {};
        result.payload.forEach((item: any) => {
          utilizationMap[item.slotId] = item.utilization;
        });
        setUtilization(utilizationMap);
      }
    } catch (error) {
      console.error('Failed to load utilization:', error);
    }
  }, [dispatch, selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadSlots(), loadUtilization()]);
    setRefreshing(false);
  }, [loadSlots, loadUtilization]);

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      timeFrom: '09:00',
      timeTo: '12:00',
      capacity: '50',
      charge: '0',
      type: 'morning',
      available: true,
    });
  };

  const handleAddSlot = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditSlot = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
    const [timeFrom, timeTo] = slot.time.split(' - ');
    setFormData({
      date: slot.date,
      timeFrom: timeFrom || '09:00',
      timeTo: timeTo || '12:00',
      capacity: slot.capacity.toString(),
      charge: slot.charge.toString(),
      type: slot.type,
      available: slot.available,
    });
    setShowEditModal(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this delivery slot?',
      [
        { text: 'Cancel', style: 'cancel' },
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
      date: formData.date,
      time: `${formData.timeFrom} - ${formData.timeTo}`,
      capacity: parseInt(formData.capacity),
      charge: parseFloat(formData.charge),
      type: formData.type,
      available: formData.available,
      bookedCount: 0,
      estimatedDelivery: formData.type === 'express' ? 'Same day' : 'Next day',
    };

    try {
      if (selectedSlot) {
        await dispatch(updateDeliverySlot({
          id: selectedSlot.id,
          updates: slotData,
        }));
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
    const slotUtilization = utilization[slot.id] || (slot.bookedCount / slot.capacity) * 100;
    const utilizationColor = getUtilizationColor(slotUtilization);

    return (
      <View key={slot.id} style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <View style={styles.slotType}>
            <Text style={[styles.slotTypeText, { color: utilizationColor }]}>
              {slot.type.toUpperCase()}
            </Text>
            {!slot.available && (
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
          <Text style={styles.slotTime}>{slot.time}</Text>
          {slot.charge > 0 && (
            <Text style={styles.slotPrice}>₹{slot.charge}</Text>
          )}
        </View>

        <View style={styles.capacityInfo}>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                {
                  width: `${slotUtilization}%`,
                  backgroundColor: utilizationColor,
                },
              ]}
            />
          </View>
          <Text style={styles.capacityText}>
            {slot.bookedCount}/{slot.capacity} ({slotUtilization.toFixed(0)}%)
          </Text>
        </View>

        <Text style={styles.slotDelivery}>
          Estimated: {slot.estimatedDelivery}
        </Text>
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
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>From Time</Text>
              <TextInput
                style={styles.input}
                value={formData.timeFrom}
                onChangeText={(text) => setFormData(prev => ({ ...prev, timeFrom: text }))}
                placeholder="HH:MM"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>To Time</Text>
              <TextInput
                style={styles.input}
                value={formData.timeTo}
                onChangeText={(text) => setFormData(prev => ({ ...prev, timeTo: text }))}
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
                onChangeText={(text) => setFormData(prev => ({ ...prev, capacity: text }))}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Charge (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.charge}
                onChangeText={(text) => setFormData(prev => ({ ...prev, charge: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Slot Type</Text>
            <View style={styles.typeSelector}>
              {(['morning', 'evening', 'express'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    formData.type === type && styles.typeOptionActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type }))}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === type && styles.typeOptionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Available</Text>
              <Switch
                value={formData.available}
                onValueChange={(value) => setFormData(prev => ({ ...prev, available: value }))}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={formData.available ? '#fff' : '#fff'}
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
              {isEdit ? 'Update' : 'Create'}
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
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          Slots for {new Date(selectedDate).toLocaleDateString()}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{morningSlots.length}</Text>
            <Text style={styles.statLabel}>Morning</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{eveningSlots.length}</Text>
            <Text style={styles.statLabel}>Evening</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{expressSlots.length}</Text>
            <Text style={styles.statLabel}>Express</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.slotsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Morning Slots */}
        {morningSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Morning Slots</Text>
            {morningSlots.map(renderSlotCard)}
          </View>
        )}

        {/* Evening Slots */}
        {eveningSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Evening Slots</Text>
            {eveningSlots.map(renderSlotCard)}
          </View>
        )}

        {/* Express Slots */}
        {expressSlots.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.sectionTitle}>Express Slots</Text>
            {expressSlots.map(renderSlotCard)}
          </View>
        )}

        {todaySlots.length === 0 && !deliverySlotsLoading && (
          <View style={styles.emptyContainer}>
            <Icon name="schedule" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No slots scheduled for this date</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddSlot}>
              <Text style={styles.emptyButtonText}>Add First Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {deliverySlotsLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading slots...</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Slot Modal */}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  slotsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  slotSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  slotActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  slotInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  slotPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  capacityInfo: {
    marginBottom: 8,
  },
  capacityBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    fontSize: 12,
    color: '#666',
  },
  slotDelivery: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 0.3,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SlotManagementScreen;
