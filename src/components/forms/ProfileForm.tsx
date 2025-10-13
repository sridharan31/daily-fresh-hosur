import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import Button from '../common/Button';
import Input from '../common/Input';

// Zod schema for validation
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      bio: initialData?.bio || '',
    },
    mode: 'onChange'
  });

  const handleFormSubmit = (data: ProfileFormData) => {
    try {
      onSubmit(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit form');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Information</Text>
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="First Name"
            control={control}
            name="firstName"
            error={errors.firstName?.message}
            placeholder="Enter first name"
            autoComplete="given-name"
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Last Name"
            control={control}
            name="lastName"
            error={errors.lastName?.message}
            placeholder="Enter last name"
            autoComplete="family-name"
          />
        </View>
      </View>

      <Input
        label="Email Address"
        control={control}
        name="email"
        error={errors.email?.message}
        placeholder="Enter email address"
        keyboardType="email-address"
        autoComplete="email"
        leftIcon="mail"
      />

      <Input
        label="Phone Number"
        control={control}
        name="phone"
        error={errors.phone?.message}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        autoComplete="tel"
        leftIcon="phone"
      />

      <Input
        label="Bio (Optional)"
        control={control}
        name="bio"
        error={errors.bio?.message}
        placeholder="Tell us about yourself"
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Button
        title="Save Profile"
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        disabled={!isValid || !isDirty}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default ProfileForm;