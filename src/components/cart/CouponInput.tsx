 // app/components/cart/CouponInput.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Coupon } from '../../../lib/types/cart';

interface CouponInputProps {
  appliedCoupon?: Coupon | null;
  loading?: boolean;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const CouponInput: React.FC<CouponInputProps> = ({
  appliedCoupon,
  loading = false,
  onApplyCoupon,
  onRemoveCoupon,
  placeholder = "Enter coupon code",
  disabled = false,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a coupon code');
      return;
    }

    try {
      await onApplyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    } catch (error: any) {
      Alert.alert('Invalid Coupon', error.message || 'Please check your coupon code and try again');
    }
  };

  const handleRemoveCoupon = () => {
    Alert.alert(
      'Remove Coupon',
      `Remove coupon "${appliedCoupon?.code}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Remove', onPress: onRemoveCoupon, style: 'destructive'},
      ]
    );
  };

  if (appliedCoupon) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedContent}>
          <Icon name="local-offer" size={20} color="#27ae60" />
          <View style={styles.appliedTextContainer}>
            <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
            <Text style={styles.appliedDescription}>
              {appliedCoupon.type === 'percentage' 
                ? `${appliedCoupon.value}% off` 
                : `AED ${appliedCoupon.value} off`
              }
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeButton}>
          <Icon name="close" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="local-offer" size={18} color="#4CAF50" />
        <Text style={styles.headerText}>Have a coupon code?</Text>
      </View>
      
      <View style={[
        styles.inputContainer,
        inputFocused && styles.inputContainerFocused,
        disabled && styles.inputContainerDisabled,
      ]}>
        <TextInput
          style={styles.input}
          value={couponCode}
          onChangeText={setCouponCode}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
          editable={!disabled && !loading}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        
        <TouchableOpacity
          onPress={handleApplyCoupon}
          style={[
            styles.applyButton,
            (!couponCode.trim() || loading || disabled) && styles.applyButtonDisabled,
          ]}
          disabled={!couponCode.trim() || loading || disabled}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Popular coupons suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Popular offers:</Text>
        <View style={styles.suggestionsRow}>
          <TouchableOpacity
            onPress={() => setCouponCode('WELCOME10')}
            style={styles.suggestionChip}
            disabled={disabled || loading}
          >
            <Text style={styles.suggestionText}>WELCOME10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCouponCode('SAVE20')}
            style={styles.suggestionChip}
            disabled={disabled || loading}
          >
            <Text style={styles.suggestionText}>SAVE20</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCouponCode('FREESHIP')}
            style={styles.suggestionChip}
            disabled={disabled || loading}
          >
            <Text style={styles.suggestionText}>FREESHIP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  inputContainerFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  inputContainerDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  appliedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedTextContainer: {
    marginLeft: 12,
  },
  appliedCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  appliedDescription: {
    fontSize: 12,
    color: '#155724',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default CouponInput;
