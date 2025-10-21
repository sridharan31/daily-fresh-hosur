// app/components/AddressFormModal.tsx
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { z } from 'zod';

// Simple html div-based modal that works on web
export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  landmark?: string;
  isDefault?: boolean;
}

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initialData?: Partial<Address>;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

const addressSchema = z.object({
  name: z.string().min(3, 'Name is required (min 3 characters)'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(pincodeRegex, 'Enter a valid 6-digit PIN code'),
  type: z.enum(['home', 'work', 'other']),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const AddressFormModal: React.FC<AddressFormModalProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  initialData = {},
  isEdit = false,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    landmark: '',
    isDefault: false,
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  
  // Use either the prop or internal state for submission status
  const isFormSubmitting = isSubmitting || internalSubmitting;
  
  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user types
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
      
      // Call the onSave callback with the form data
      onSave({
        ...formData as Address,
        id: formData.id || Date.now().toString(), // Generate a simple ID if not provided
      });
      
      // Reset form if not editing
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
      
      // We'll let the parent component handle the loading state and closing the modal
      // since it's now an async operation
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

  return (
    <div className="address-form-modal-overlay">
      <div className="address-form-modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Address' : 'Add New Address'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Full Name</label>
            <div className={`input-container ${errors.name ? 'error' : ''}`}>
              <Icon name="person" size={20} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className={`input-container ${errors.phone ? 'error' : ''}`}>
              <Icon name="phone" size={20} />
              <input
                type="text"
                placeholder="Enter your 10-digit mobile number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                maxLength={10}
              />
            </div>
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <div className={`input-container ${errors.street ? 'error' : ''}`}>
              <Icon name="home" size={20} />
              <textarea
                placeholder="Enter your street address"
                value={formData.street || ''}
                onChange={(e) => handleChange('street', e.target.value)}
                rows={2}
              />
            </div>
            {errors.street && <div className="error-message">{errors.street}</div>}
          </div>

          <div className="form-group">
            <label>Landmark (Optional)</label>
            <div className="input-container">
              <Icon name="location-on" size={20} />
              <input
                type="text"
                placeholder="Enter nearby landmark"
                value={formData.landmark || ''}
                onChange={(e) => handleChange('landmark', e.target.value)}
              />
            </div>
          </div>

          <div className="row-container">
            <div className="form-group half-width">
              <label>City</label>
              <div className={`input-container ${errors.city ? 'error' : ''}`}>
                <Icon name="location-city" size={20} />
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              {errors.city && <div className="error-message">{errors.city}</div>}
            </div>

            <div className="form-group half-width">
              <label>State</label>
              <div className={`input-container ${errors.state ? 'error' : ''}`}>
                <Icon name="map" size={20} />
                <input
                  type="text"
                  placeholder="Enter state"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
              {errors.state && <div className="error-message">{errors.state}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>PIN Code</label>
            <div className={`input-container ${errors.pincode ? 'error' : ''}`}>
              <Icon name="pin-drop" size={20} />
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                maxLength={6}
              />
            </div>
            {errors.pincode && <div className="error-message">{errors.pincode}</div>}
          </div>

          <div className="form-group">
            <label>Address Type</label>
            <div className="address-type-buttons">
              <button
                type="button"
                className={`type-button ${formData.type === 'home' ? 'selected' : ''}`}
                onClick={() => handleAddressTypeSelect('home')}
              >
                <Icon name="home" size={18} />
                <span>Home</span>
              </button>
              
              <button
                type="button"
                className={`type-button ${formData.type === 'work' ? 'selected' : ''}`}
                onClick={() => handleAddressTypeSelect('work')}
              >
                <Icon name="business" size={18} />
                <span>Work</span>
              </button>
              
              <button
                type="button"
                className={`type-button ${formData.type === 'other' ? 'selected' : ''}`}
                onClick={() => handleAddressTypeSelect('other')}
              >
                <Icon name="place" size={18} />
                <span>Other</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <div 
              className="default-address-container"
              onClick={() => handleChange('isDefault', !formData.isDefault)}
            >
              <div className={`checkbox ${formData.isDefault ? 'checked' : ''}`}>
                {formData.isDefault && <Icon name="check" size={16} />}
              </div>
              <span>Set as default delivery address</span>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className={`save-button ${isFormSubmitting ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={isFormSubmitting}
          >
            {isFormSubmitting ? (
              <>
                <span className="spinner"></span>
                <span style={{ marginLeft: '10px' }}>Saving...</span>
              </>
            ) : (
              isEdit ? 'Update Address' : 'Save Address'
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .address-form-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .address-form-modal {
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
          background-color: #f9f9f9;
        }
        
        .modal-header h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        
        .close-button {
          background: #f1f1f1;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #555;
        }
        
        .modal-body {
          padding: 15px;
          max-height: calc(90vh - 130px);
          overflow-y: auto;
        }
        
        .form-group {
          margin-bottom: 18px;
        }
        
        .form-group label {
          display: block;
          font-size: 16px;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }
        
        .input-container {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
          overflow: hidden;
          padding: 0 12px;
        }
        
        .input-container.error {
          border-color: #ff4d4f;
          background-color: #fff2f0;
        }
        
        .input-container input,
        .input-container textarea {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          font-size: 16px;
          color: #333;
          outline: none;
          width: 100%;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          color: red;
          font-size: 12px;
          margin-top: 6px;
        }
        
        .row-container {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }
        
        .half-width {
          flex: 1;
        }
        
        .address-type-buttons {
          display: flex;
          gap: 10px;
        }
        
        .type-button {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .type-button span {
          margin-left: 6px;
          color: #555;
          font-weight: 500;
        }
        
        .type-button.selected {
          background-color: #4CAF50;
          border-color: #4CAF50;
        }
        
        .type-button.selected span {
          color: white;
          font-weight: bold;
        }
        
        .default-address-container {
          display: flex;
          align-items: center;
          margin-top: 10px;
          padding: 8px;
          cursor: pointer;
        }
        
        .checkbox {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 2px solid #4CAF50;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .checkbox.checked {
          background-color: #4CAF50;
        }
        
        .checkbox.checked svg {
          color: white;
        }
        
        .modal-footer {
          padding: 15px;
          border-top: 1px solid #eee;
          background-color: #f9f9f9;
        }
        
        .save-button {
          width: 100%;
          background-color: #4CAF50;
          color: white;
          padding: 15px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .save-button:hover {
          background-color: #3d9140;
        }
        
        .save-button.disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to {transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
};

export default AddressFormModal;