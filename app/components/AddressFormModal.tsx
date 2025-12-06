// app/components/AddressFormModal.tsx
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import React, { useCallback, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const [mapCenter, setMapCenter] = useState({ lat: 12.7409, lng: 77.8253 }); // Default to Hosur
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyC-9SAU7AfA-0sb1ILZwDwXW8g-wfl-L9E'
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
      setMapCenter({ lat, lng });
    }
  }, []);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLocation.lat},${selectedLocation.lng}&key=AIzaSyC-9SAU7AfA-0sb1ILZwDwXW8g-wfl-L9E`)
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results[0]) {
            const addressComponents = data.results[0].address_components;
            let street = '';
            let city = '';
            let state = '';
            let pincode = '';
            let landmark = '';

            console.log("Geocoding results:", data.results[0]);

            addressComponents.forEach((component: any) => {
              if (component.types.includes('route') || component.types.includes('street_address')) {
                street = component.long_name;
              }
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (component.types.includes('postal_code')) {
                pincode = component.long_name;
              }
              if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
                landmark = component.long_name;
              }
            });

            if (!street) {
              street = data.results[0].formatted_address.split(',')[0];
            }

            setFormData(prev => ({
              ...prev,
              street: street,
              city: city,
              state: state,
              pincode: pincode,
              landmark: landmark
            }));
          }
        })
        .catch(err => console.error("Geocoding error:", err));

      setShowMap(false);
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
      addressSchema.parse(formData);

      onSave({
        ...formData as Address,
        id: formData.id || Date.now().toString(),
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

  if (!visible) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    mapModal: {
      width: '90%',
      height: '80%',
      maxWidth: '800px',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>{isEdit ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '15px', maxHeight: 'calc(90vh - 130px)', overflowY: 'auto' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.name ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.name ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
              <Icon name="person" size={20} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
              />
            </div>
            {errors.name && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.name}</div>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>Phone Number</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.phone ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.phone ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
              <Icon name="phone" size={20} />
              <input
                type="text"
                placeholder="Enter your 10-digit mobile number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                maxLength={10}
                style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
              />
            </div>
            {errors.phone && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.phone}</div>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>Street Address</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.street ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.street ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
              <Icon name="home" size={20} />
              <textarea
                placeholder="Enter your street address"
                value={formData.street || ''}
                onChange={(e) => handleChange('street', e.target.value)}
                rows={2}
                style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
              />
            </div>
            {errors.street && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.street}</div>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#e3f2fd',
                border: '1px dashed #2196f3',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#2196f3',
                fontWeight: 'bold'
              }}
            >
              <div style={{ marginRight: '8px' }}>📍</div>
              Select Location on Map
            </button>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>Landmark (Optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
              <Icon name="location-on" size={20} />
              <input
                type="text"
                placeholder="Enter nearby landmark"
                value={formData.landmark || ''}
                onChange={(e) => handleChange('landmark', e.target.value)}
                style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <div style={{ flex: 1, marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>City</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.city ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.city ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
                <Icon name="location-city" size={20} />
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
                />
              </div>
              {errors.city && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.city}</div>}
            </div>

            <div style={{ flex: 1, marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>State</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.state ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.state ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
                <Icon name="map" size={20} />
                <input
                  type="text"
                  placeholder="Enter state"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
                />
              </div>
              {errors.state && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.state}</div>}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>PIN Code</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${errors.pincode ? '#ff4d4f' : '#ddd'}`, borderRadius: '8px', backgroundColor: errors.pincode ? '#fff2f0' : '#f9f9f9', overflow: 'hidden', padding: '0 12px' }}>
              <Icon name="pin-drop" size={20} />
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                maxLength={6}
                style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', fontSize: '16px', color: '#333', outline: 'none', width: '100%' }}
              />
            </div>
            {errors.pincode && <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontSize: '12px', marginTop: '6px' }}>{errors.pincode}</div>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '16px', marginBottom: '6px', fontWeight: 500, color: '#333' }}>Address Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleAddressTypeSelect('home')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'home' ? '#4CAF50' : '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="home" size={18} color={formData.type === 'home' ? 'white' : '#555'} />
                <span style={{ marginLeft: '6px', color: formData.type === 'home' ? 'white' : '#555', fontWeight: formData.type === 'home' ? 'bold' : 500 }}>Home</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddressTypeSelect('work')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'work' ? '#4CAF50' : '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="business" size={18} color={formData.type === 'work' ? 'white' : '#555'} />
                <span style={{ marginLeft: '6px', color: formData.type === 'work' ? 'white' : '#555', fontWeight: formData.type === 'work' ? 'bold' : 500 }}>Work</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddressTypeSelect('other')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'other' ? '#4CAF50' : '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="place" size={18} color={formData.type === 'other' ? 'white' : '#555'} />
                <span style={{ marginLeft: '6px', color: formData.type === 'other' ? 'white' : '#555', fontWeight: formData.type === 'other' ? 'bold' : 500 }}>Other</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div
              onClick={() => handleChange('isDefault', !formData.isDefault)}
              style={{ display: 'flex', alignItems: 'center', marginTop: '10px', padding: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '4px',
                border: '2px solid #4CAF50',
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: formData.isDefault ? '#4CAF50' : 'transparent',
              }}>
                {formData.isDefault && <Icon name="check" size={16} color="white" />}
              </div>
              <span>Set as default delivery address</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '15px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
          <button
            onClick={handleSave}
            disabled={isFormSubmitting}
            style={{
              width: '100%',
              backgroundColor: isFormSubmitting ? '#a5d6a7' : '#4CAF50',
              color: 'white',
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isFormSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            {isFormSubmitting ? (
              <>
                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s linear infinite' }}></span>
                <span style={{ marginLeft: '10px' }}>Saving...</span>
              </>
            ) : (
              isEdit ? 'Update Address' : 'Save Address'
            )}
          </button>
        </div>
      </div>

      {showMap && isLoaded && (
        <div style={{ ...styles.overlay, zIndex: 1100 }}>
          <div style={{ ...styles.modal, ...styles.mapModal }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>Select Location</h2>
              <button
                onClick={() => setShowMap(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div style={{ height: 'calc(100% - 120px)', padding: 0 }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={14}
                onClick={onMapClick}
              >
                {selectedLocation && (
                  <Marker position={selectedLocation} />
                )}
              </GoogleMap>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
                style={{
                  padding: '10px 20px',
                  borderRadius: '5px',
                  border: 'none',
                  background: selectedLocation ? '#4CAF50' : '#ccc',
                  color: 'white',
                  cursor: selectedLocation ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressFormModal;