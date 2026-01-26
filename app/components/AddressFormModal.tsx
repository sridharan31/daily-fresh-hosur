// app/components/AddressFormModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { z } from 'zod';

// Define the address schema for validation
const addressSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  street: z.string().min(5, 'Street address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'PIN code must be 6 digits'),
  landmark: z.string().optional(),
  type: z.enum(['home', 'work', 'other']),
  isDefault: z.boolean().optional(),
});

export interface Address {
  id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initialData?: Address | null;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  isEdit = false,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    isDefault: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Default to Hosur
  const [region, setRegion] = useState({
    latitude: 12.7409,
    longitude: 77.8253,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (visible) {
      setFormData({
        type: 'home',
        isDefault: false,
        ...initialData,
      });
      setErrors({});
    }
  }, [visible, initialData]);

  const onMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = async () => {
    if (selectedLocation) {
      try {
        // Geocoding logic would go here
        // For now we'll mock it or use a service if available
        // Since we removed the direct fetch in the rewrite to ensure safety:

        console.log("Selected location:", selectedLocation);

        // This is a placeholder for actual reverse geocoding
        // In a real app, you'd call Google Geocoding API or similar here
        // For the purpose of this fix, we'll let the user fill in the details
        // but normally we'd autofill

        setShowMap(false);
        Alert.alert(
          "Location Selected",
          "Coordinates captured. Please fill in the address details."
        );
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }
  };

  const isFormSubmitting = isSubmitting || internalSubmitting;

  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleSave = () => {
    try {
      setInternalSubmitting(true);

      // Ensure specific types are respected
      const cleanData: any = { ...formData };
      if (!cleanData.type) cleanData.type = 'home';

      addressSchema.parse(cleanData);

      onSave({
        ...cleanData as Address,
        id: cleanData.id || Date.now().toString(),
      });

      if (!isEdit) {
        setFormData({
          name: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          type: 'home',
          landmark: '',
          isDefault: false,
        });
      }

      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0].toString();
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      setInternalSubmitting(false);
    }
  };

  const handleAddressTypeSelect = (type: 'home' | 'work' | 'other') => {
    setFormData({
      ...formData,
      type
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Address' : 'Add New Address'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name || ''}
                  onChangeText={(text) => handleChange('name', text)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone || ''}
                  onChangeText={(text) => handleChange('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <View style={[styles.inputContainer, errors.street ? styles.inputError : null]}>
                <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter street address"
                  value={formData.street || ''}
                  onChangeText={(text) => handleChange('street', text)}
                  multiline
                  numberOfLines={2}
                />
              </View>
              {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
            </View>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMap(true)}
            >
              <Ionicons name="map-outline" size={20} color="#2196f3" />
              <Text style={styles.mapButtonText}>Select Location on Map</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Landmark (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter nearby landmark"
                  value={formData.landmark || ''}
                  onChangeText={(text) => handleChange('landmark', text)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>City</Text>
                <View style={[styles.inputContainer, errors.city ? styles.inputError : null]}>
                  <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={formData.city || ''}
                    onChangeText={(text) => handleChange('city', text)}
                  />
                </View>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}>
                <Text style={styles.label}>State</Text>
                <View style={[styles.inputContainer, errors.state ? styles.inputError : null]}>
                  <Ionicons name="map" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={formData.state || ''}
                    onChangeText={(text) => handleChange('state', text)}
                  />
                </View>
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PIN Code</Text>
              <View style={[styles.inputContainer, errors.pincode ? styles.inputError : null]}>
                <Ionicons name="pin-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit PIN code"
                  value={formData.pincode || ''}
                  onChangeText={(text) => handleChange('pincode', text)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeContainer}>
                {(['home', 'work', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonSelected
                    ]}
                    onPress={() => handleAddressTypeSelect(type)}
                  >
                    <Ionicons
                      name={type === 'home' ? 'home' : type === 'work' ? 'briefcase' : 'location'}
                      size={18}
                      color={formData.type === type ? 'white' : '#555'}
                    />
                    <Text style={[
                      styles.typeText,
                      formData.type === type && styles.typeTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.defaultCheckbox}
              onPress={() => handleChange('isDefault', !formData.isDefault)}
            >
              <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
                {formData.isDefault && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.defaultText}>Set as default delivery address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                isFormSubmitting && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={isFormSubmitting}
            >
              {isFormSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>{isEdit ? 'Update Address' : 'Save Address'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMap(false)} style={styles.closeMapButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              disabled={!selectedLocation}
              style={[styles.confirmMapButton, !selectedLocation && styles.disabledButton]}
            >
              <Text style={styles.confirmMapText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={onMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
              />
            )}
          </MapView>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#ff4d4f',
    backgroundColor: '#fff2f0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 15,
  },
  mapButtonText: {
    color: '#2196f3',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  typeButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeText: {
    marginLeft: 5,
    color: '#555',
    fontWeight: '500',
  },
  typeTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  defaultText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  closeMapButton: {
    padding: 5,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmMapButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmMapText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default AddressFormModal;