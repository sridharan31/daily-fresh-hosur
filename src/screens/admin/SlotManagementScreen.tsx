// src/screens/admin/SlotManagementScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../../lib/supabase';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../components/ui/WebCompatibleComponents';

interface SlotTemplate {
  id: string;
  slot_type: 'weekday' | 'weekend';
  start_time: string;
  end_time: string;
  max_orders: number;
  repeat_weekly: boolean;
  repeat_end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface SlotInstance {
  id: string;
  template_id: string;
  slot_date: string;
  start_ts: string;
  end_ts: string;
  slot_type: 'weekday' | 'weekend';
  capacity: number;
  booked_count: number;
  status: 'available' | 'full' | 'expired' | 'closed';
}

interface SlotFormData {
  slot_type: 'weekday' | 'weekend';
  start_time: string;
  end_time: string;
  max_orders: string;
  repeat_weekly: boolean;
  repeat_end_date: string;
}

const SlotManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [templates, setTemplates] = useState<SlotTemplate[]>([]);
  const [instances, setInstances] = useState<SlotInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>('weekday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SlotTemplate | null>(null);
  
  const [formData, setFormData] = useState<SlotFormData>({
    slot_type: 'weekday',
    start_time: '09:00',
    end_time: '12:00',
    max_orders: '50',
    repeat_weekly: true,
    repeat_end_date: '',
  });

  // Date/time picker states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    loadTemplates();
    loadInstances();
  }, [activeTab]);

  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_slot_templates')
        .select('*')
        .order('start_time');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load slot templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInstances = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_slot_instances')
        .select('*')
        .eq('slot_type', activeTab)
        .order('slot_date');

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error loading instances:', error);
    }
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTemplates(), loadInstances()]);
    setRefreshing(false);
  }, [loadTemplates, loadInstances]);

  const resetForm = () => {
    setFormData({
      slot_type: activeTab,
      start_time: '09:00',
      end_time: '12:00',
      max_orders: '50',
      repeat_weekly: true,
      repeat_end_date: '',
    });
    setSelectedTemplate(null);
  };

  const handleAddSlot = () => {
    resetForm();
    setFormData(prev => ({ ...prev, slot_type: activeTab }));
    setShowAddModal(true);
  };

  const handleEditSlot = (template: SlotTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      slot_type: template.slot_type,
      start_time: template.start_time,
      end_time: template.end_time,
      max_orders: template.max_orders.toString(),
      repeat_weekly: template.repeat_weekly,
      repeat_end_date: template.repeat_end_date || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteSlot = (templateId: string) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this slot? All instances will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('delivery_slot_templates')
                .delete()
                .eq('id', templateId);

              if (error) throw error;
              loadTemplates();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete slot');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.start_time || !formData.end_time || !formData.max_orders) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('delivery_slot_templates')
          .update({
            start_time: formData.start_time,
            end_time: formData.end_time,
            max_orders: parseInt(formData.max_orders),
            repeat_weekly: formData.repeat_weekly,
            repeat_end_date: formData.repeat_end_date || null,
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('delivery_slot_templates')
          .insert([{
            slot_type: formData.slot_type,
            start_time: formData.start_time,
            end_time: formData.end_time,
            max_orders: parseInt(formData.max_orders),
            repeat_weekly: formData.repeat_weekly,
            repeat_end_date: formData.repeat_end_date || null,
          }]);

        if (error) throw error;
      }

      setShowAddModal(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving slot:', error);
      Alert.alert('Error', 'Failed to save slot');
    }
  };

  const handleToggleActive = async (template: SlotTemplate) => {
    try {
      const { error } = await supabase
        .from('delivery_slot_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to update slot');
    }
  };

  const filteredTemplates = templates.filter(t => t.slot_type === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => (navigation as any)?.goBack?.()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Delivery Slots</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSlot}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekday' && styles.tabActive]}
          onPress={() => setActiveTab('weekday')}
        >
          <Text style={[styles.tabText, activeTab === 'weekday' && styles.tabTextActive]}>
            Weekday Slots
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekend' && styles.tabActive]}
          onPress={() => setActiveTab('weekend')}
        >
          <Text style={[styles.tabText, activeTab === 'weekend' && styles.tabTextActive]}>
            Weekend Slots
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : filteredTemplates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="schedule" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab} slots configured</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddSlot}>
              <Text style={styles.emptyButtonText}>Add First Slot</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTemplates.map((template) => (
            <View key={template.id} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotType}>
                  <Text style={styles.slotTypeText}>
                    {template.start_time} - {template.end_time}
                  </Text>
                  {!template.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>PAUSED</Text>
                    </View>
                  )}
                </View>
                <View style={styles.slotActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditSlot(template)}
                  >
                    <Icon name="edit" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleActive(template)}
                  >
                    <Icon
                      name={template.is_active ? 'pause' : 'play-arrow'}
                      size={20}
                      color={template.is_active ? '#FF9800' : '#4CAF50'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteSlot(template.id)}
                  >
                    <Icon name="delete" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.slotInfo}>
                <Text style={styles.slotDetail}>Max Orders: {template.max_orders}</Text>
                <Text style={styles.slotDetail}>
                  Repeat Weekly: {template.repeat_weekly ? 'Yes' : 'No'}
                </Text>
                {template.repeat_end_date && (
                  <Text style={styles.slotDetail}>
                    End Date: {new Date(template.repeat_end_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedTemplate ? 'Edit Slot' : 'Add New Slot'}
            </Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Slot Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.slot_type === 'weekday' && styles.typeOptionActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, slot_type: 'weekday' }))}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.slot_type === 'weekday' && styles.typeOptionTextActive,
                    ]}
                  >
                    Weekday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.slot_type === 'weekend' && styles.typeOptionActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, slot_type: 'weekend' }))}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.slot_type === 'weekend' && styles.typeOptionTextActive,
                    ]}
                  >
                    Weekend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.inputText}>{formData.start_time || 'Select Time'}</Text>
                  <Icon name="access-time" size={20} color="#666" />
                </TouchableOpacity>
                {showStartTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowStartTimePicker(Platform.OS === 'ios');
                      if (selectedTime && event.type !== 'dismissed') {
                        setStartTime(selectedTime);
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        setFormData(prev => ({ ...prev, start_time: `${hours}:${minutes}` }));
                      }
                    }}
                  />
                )}
                {showStartTimePicker && Platform.OS === 'web' && (
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, start_time: e.target.value }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                    }}
                  />
                )}
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.inputText}>{formData.end_time || 'Select Time'}</Text>
                  <Icon name="access-time" size={20} color="#666" />
                </TouchableOpacity>
                {showEndTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowEndTimePicker(Platform.OS === 'ios');
                      if (selectedTime && event.type !== 'dismissed') {
                        setEndTime(selectedTime);
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        setFormData(prev => ({ ...prev, end_time: `${hours}:${minutes}` }));
                      }
                    }}
                  />
                )}
                {showEndTimePicker && Platform.OS === 'web' && (
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, end_time: e.target.value }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                    }}
                  />
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Max Orders</Text>
              <TextInput
                style={styles.input}
                value={formData.max_orders}
                onChangeText={(text) => setFormData(prev => ({ ...prev, max_orders: text }))}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Repeat Weekly</Text>
                <Switch
                  value={formData.repeat_weekly}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, repeat_weekly: value }))}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                />
              </View>
            </View>

            {formData.repeat_weekly && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>End Date (Optional)</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.inputText}>
                    {formData.repeat_end_date || 'Select Date'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                {showEndDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (selectedDate && event.type !== 'dismissed') {
                        setEndDate(selectedDate);
                        const year = selectedDate.getFullYear();
                        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                        const day = selectedDate.getDate().toString().padStart(2, '0');
                        setFormData(prev => ({ ...prev, repeat_end_date: `${year}-${month}-${day}` }));
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
                {showEndDatePicker && Platform.OS === 'web' && (
                  <input
                    type="date"
                    value={formData.repeat_end_date}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, repeat_end_date: e.target.value }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                    }}
                  />
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => { setShowAddModal(false); resetForm(); }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>
                {selectedTemplate ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4CAF50',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    gap: 4,
  },
  slotDetail: {
    fontSize: 14,
    color: '#666',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 0.48,
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

