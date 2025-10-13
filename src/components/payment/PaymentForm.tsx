 // app/components/payment/PaymentForm.tsx
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import { CreatePaymentRequest } from '../../../lib/types/payment';
import Button from '../common/Button';
import Input from '../common/Input';

interface PaymentFormProps {
  onSubmit: (paymentData: CreatePaymentRequest) => void;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

interface FormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  upiId?: string;
  walletNumber?: string;
}

interface FormErrors {
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  upiId?: string;
  walletNumber?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  loading = false,
  style,
  testID,
}) => {
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'wallet'>('card');
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    walletNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (paymentType === 'card') {
      // Validate card number
      const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
      if (!cleanCardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        newErrors.cardNumber = 'Invalid card number';
      }

      // Validate expiry
      if (!formData.expiryMonth) {
        newErrors.expiryMonth = 'Month is required';
      } else if (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
        newErrors.expiryMonth = 'Invalid month';
      }

      if (!formData.expiryYear) {
        newErrors.expiryYear = 'Year is required';
      } else if (parseInt(formData.expiryYear) < new Date().getFullYear()) {
        newErrors.expiryYear = 'Card has expired';
      }

      // Validate CVV
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        newErrors.cvv = 'Invalid CVV';
      }

      // Validate cardholder name
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else if (paymentType === 'upi') {
      // Validate UPI ID
      if (!formData.upiId) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!formData.upiId.includes('@')) {
        newErrors.upiId = 'Invalid UPI ID format';
      }
    } else if (paymentType === 'wallet') {
      // Validate wallet number
      if (!formData.walletNumber) {
        newErrors.walletNumber = 'Wallet number is required';
      } else if (formData.walletNumber.length < 10) {
        newErrors.walletNumber = 'Invalid wallet number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    const paymentData: CreatePaymentRequest = {
      amount: 0, // This will be set by parent component
      currency: 'AED',
      orderId: '', // This will be set by parent component
      paymentMethodId: '', // This will be generated based on form data
      savePaymentMethod: true,
      confirmationMethod: 'automatic',
      metadata: {
        paymentType,
        formData: paymentType === 'card' ? {
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cardholderName: formData.cardholderName,
        } : paymentType === 'upi' ? {
          upiId: formData.upiId,
        } : {
          walletNumber: formData.walletNumber,
        }
      }
    };

    onSubmit(paymentData);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setFormData(prev => ({...prev, cardNumber: formatted}));
  };

  const renderCardForm = () => (
    <>
      <Input
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        value={formData.cardNumber}
        onChangeText={handleCardNumberChange}
        keyboardType="numeric"
        maxLength={19}
        error={errors.cardNumber}
        leftIcon="credit-card"
        testID={`${testID}-card-number`}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Month"
            placeholder="MM"
            value={formData.expiryMonth}
            onChangeText={(value) => setFormData(prev => ({...prev, expiryMonth: value}))}
            keyboardType="numeric"
            maxLength={2}
            error={errors.expiryMonth}
            testID={`${testID}-expiry-month`}
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Year"
            placeholder="YYYY"
            value={formData.expiryYear}
            onChangeText={(value) => setFormData(prev => ({...prev, expiryYear: value}))}
            keyboardType="numeric"
            maxLength={4}
            error={errors.expiryYear}
            testID={`${testID}-expiry-year`}
          />
        </View>
      </View>

      <Input
        label="CVV"
        placeholder="123"
        value={formData.cvv}
        onChangeText={(value) => setFormData(prev => ({...prev, cvv: value}))}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry={true}
        error={errors.cvv}
        leftIcon="security"
        testID={`${testID}-cvv`}
      />

      <Input
        label="Cardholder Name"
        placeholder="Enter name as on card"
        value={formData.cardholderName}
        onChangeText={(value) => setFormData(prev => ({...prev, cardholderName: value}))}
        error={errors.cardholderName}
        leftIcon="person"
        testID={`${testID}-cardholder-name`}
      />
    </>
  );

  const renderUPIForm = () => (
    <Input
      label="UPI ID"
      placeholder="yourname@paytm"
      value={formData.upiId}
      onChangeText={(value) => setFormData(prev => ({...prev, upiId: value}))}
      keyboardType="email-address"
      error={errors.upiId}
      leftIcon="account-balance"
      testID={`${testID}-upi-id`}
    />
  );

  const renderWalletForm = () => (
    <Input
      label="Wallet Number"
      placeholder="Enter wallet number"
      value={formData.walletNumber}
      onChangeText={(value) => setFormData(prev => ({...prev, walletNumber: value}))}
      keyboardType="numeric"
      error={errors.walletNumber}
      leftIcon="account-balance-wallet"
      testID={`${testID}-wallet-number`}
    />
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>Payment Details</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Payment Type Selector */}
        <View style={styles.typeSelector}>
          <Button
            title="Card"
            variant={paymentType === 'card' ? 'primary' : 'outline'}
            onPress={() => setPaymentType('card')}
            style={styles.typeButton}
          />
          <Button
            title="UPI"
            variant={paymentType === 'upi' ? 'primary' : 'outline'}
            onPress={() => setPaymentType('upi')}
            style={styles.typeButton}
          />
          <Button
            title="Wallet"
            variant={paymentType === 'wallet' ? 'primary' : 'outline'}
            onPress={() => setPaymentType('wallet')}
            style={styles.typeButton}
          />
        </View>

        {/* Form Fields */}
        {paymentType === 'card' && renderCardForm()}
        {paymentType === 'upi' && renderUPIForm()}
        {paymentType === 'wallet' && renderWalletForm()}

        {/* Submit Button */}
        <Button
          title="Continue to Payment"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          testID={`${testID}-submit`}
        />

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your payment information is secure and encrypted with industry-standard SSL technology.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  securityNote: {
    backgroundColor: '#f8fff8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  securityText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
});

export default PaymentForm;
