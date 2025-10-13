import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { z } from 'zod';

// Zod validation schema
const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    state: z.string().min(2, 'State must be at least 2 characters'),
  }),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Example component showing React Hook Form + Zod validation
export const UserProfileForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
        state: '',
      },
    },
  });

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Form submitted:', data);
              // Reset form or navigate away
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="user" size={32} color="#3b82f6" />
        <Text style={styles.title}>Update Profile</Text>
        <Text style={styles.subtitle}>Keep your information up to date</Text>
      </View>

      <View style={styles.form}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <FormField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
            icon="user"
          />

          <FormField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
            icon="user"
          />

          <FormField
            control={control}
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            error={errors.email?.message}
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            control={control}
            name="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            error={errors.phone?.message}
            icon="phone"
            keyboardType="phone-pad"
          />
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          
          <FormField
            control={control}
            name="address.street"
            label="Street Address"
            placeholder="123 Main Street"
            error={errors.address?.street?.message}
            icon="map-pin"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                control={control}
                name="address.city"
                label="City"
                placeholder="City"
                error={errors.address?.city?.message}
                icon="home"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <FormField
                control={control}
                name="address.state"
                label="State"
                placeholder="State"
                error={errors.address?.state?.message}
                icon="map"
              />
            </View>
          </View>

          <FormField
            control={control}
            name="address.zipCode"
            label="ZIP Code"
            placeholder="12345"
            error={errors.address?.zipCode?.message}
            icon="hash"
            keyboardType="numeric"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.button, styles.secondaryButton]}
            disabled={isSubmitting}
          >
            <Icon name="refresh-cw" size={16} color="#6b7280" />
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={[
              styles.button,
              styles.primaryButton,
              (!isValid || isSubmitting) && styles.disabledButton,
            ]}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="loader" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Updating...</Text>
              </>
            ) : (
              <>
                <Icon name="save" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

interface FormFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  icon: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const FormField: React.FC<FormFieldProps> = ({
  control,
  name,
  label,
  placeholder,
  error,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <Icon name={icon} size={16} color={error ? '#ef4444' : '#9ca3af'} />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserProfileForm;