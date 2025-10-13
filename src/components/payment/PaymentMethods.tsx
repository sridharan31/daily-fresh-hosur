 // app/components/payment/PaymentMethods.tsx
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PaymentMethod } from '../../../lib/types/payment';

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  selectedMethod?: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
  onAddNewMethod?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  selectedMethod,
  onMethodSelect,
  onAddNewMethod,
  style,
  testID,
}) => {
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'credit-card';
      case 'upi':
        return 'account-balance';
      case 'wallet':
        return 'account-balance-wallet';
      case 'cod':
        return 'money';
      default:
        return 'payment';
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#2196F3';
      case 'upi':
        return '#FF9800';
      case 'wallet':
        return '#9C27B0';
      case 'cod':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const formatMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `**** **** **** ${method.details?.last4 || '****'}`;
      case 'upi':
        return method.details?.upiId || 'UPI Payment';
      case 'wallet':
        return `${method.name} Wallet`;
      case 'cod':
        return 'Pay on Delivery';
      default:
        return method.name;
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod?.id === method.id;
    const iconColor = getMethodColor(method.type);

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodItem,
          isSelected && styles.selectedMethod,
        ]}
        onPress={() => onMethodSelect(method)}
        testID={`${testID}-method-${method.id}`}
      >
        <View style={styles.methodContent}>
          <View style={[styles.methodIcon, {backgroundColor: `${iconColor}20`}]}>
            <Icon 
              name={getMethodIcon(method.type)} 
              size={24} 
              color={iconColor} 
            />
          </View>

          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDetails}>
              {formatMethodDetails(method)}
            </Text>
            {method.isDefault && (
              <Text style={styles.defaultBadge}>Default</Text>
            )}
          </View>

          <View style={styles.methodAction}>
            <View style={[
              styles.radioButton,
              isSelected && styles.radioButtonSelected,
            ]}>
              {isSelected && (
                <Icon name="check" size={16} color="#fff" />
              )}
            </View>
          </View>
        </View>

        {method.type === 'card' && method.details?.expiryMonth && (
          <View style={styles.cardExpiry}>
            <Text style={styles.expiryText}>
              Expires: {method.details.expiryMonth}/{method.details.expiryYear}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>Payment Methods</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {paymentMethods.map(renderPaymentMethod)}

        {onAddNewMethod && (
          <TouchableOpacity
            style={styles.addMethodButton}
            onPress={onAddNewMethod}
            testID={`${testID}-add-method`}
          >
            <View style={styles.addMethodIcon}>
              <Icon name="add" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.addMethodText}>Add New Payment Method</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment Security Info */}
      <View style={styles.securityInfo}>
        <Icon name="security" size={16} color="#4CAF50" />
        <Text style={styles.securityText}>
          Your payment information is secure and encrypted
        </Text>
      </View>
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
  methodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    padding: 16,
  },
  selectedMethod: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  methodAction: {
    marginLeft: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  cardExpiry: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expiryText: {
    fontSize: 12,
    color: '#666',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 20,
  },
  addMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
});

export default PaymentMethods;