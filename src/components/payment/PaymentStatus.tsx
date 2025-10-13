// app/components/payment/PaymentStatus.tsx
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PaymentStatus as PaymentStatusType } from '../../../lib/types/order';
import Button from '../common/Button';

interface PaymentStatusProps {
  status: PaymentStatusType;
  amount?: number;
  currency?: string;
  transactionId?: string;
  orderId?: string;
  message?: string;
  onRetry?: () => void;
  onContinue?: () => void;
  onGoHome?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  amount,
  currency = 'AED',
  transactionId,
  orderId,
  message,
  onRetry,
  onContinue,
  onGoHome,
  style,
  testID,
}) => {
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          title: 'Payment Successful!',
          message: message || 'Your payment has been processed successfully.',
          showContinue: true,
        };
      case 'failed':
        return {
          icon: 'error',
          color: '#F44336',
          title: 'Payment Failed',
          message: message || 'We could not process your payment. Please try again.',
          showRetry: true,
        };
      case 'cancelled':
        return {
          icon: 'cancel',
          color: '#FF9800',
          title: 'Payment Cancelled',
          message: message || 'You have cancelled the payment process.',
          showRetry: true,
        };
      case 'pending':
        return {
          icon: 'schedule',
          color: '#2196F3',
          title: 'Payment Pending',
          message: message || 'Your payment is being processed. Please wait.',
          showContinue: false,
        };
      case 'refunded':
        return {
          icon: 'undo',
          color: '#9C27B0',
          title: 'Payment Refunded',
          message: message || 'Your payment has been refunded successfully.',
          showContinue: true,
        };
      default:
        return {
          icon: 'help',
          color: '#666',
          title: 'Unknown Status',
          message: message || 'Payment status is unknown.',
          showRetry: true,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Animated.View 
        style={[
          styles.content,
          {transform: [{scale: scaleValue}]}
        ]}
      >
        {/* Status Icon */}
        <View style={[styles.iconContainer, {backgroundColor: `${statusConfig.color}20`}]}>
          <Icon 
            name={statusConfig.icon} 
            size={64} 
            color={statusConfig.color} 
          />
        </View>

        {/* Status Title */}
        <Text style={[styles.title, {color: statusConfig.color}]}>
          {statusConfig.title}
        </Text>

        {/* Status Message */}
        <Text style={styles.message}>
          {statusConfig.message}
        </Text>

        {/* Amount */}
        {amount && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={[styles.amount, {color: statusConfig.color}]}>
              {formatAmount(amount, currency)}
            </Text>
          </View>
        )}

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          {transactionId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
          )}
          
          {orderId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleString('en-AE')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {statusConfig.showRetry && onRetry && (
            <Button
              title="Retry Payment"
              onPress={onRetry}
              variant="primary"
              style={styles.actionButton}
              testID={`${testID}-retry`}
            />
          )}

          {statusConfig.showContinue && onContinue && (
            <Button
              title="Continue Shopping"
              onPress={onContinue}
              variant="primary"
              style={styles.actionButton}
              testID={`${testID}-continue`}
            />
          )}

          {onGoHome && (
            <Button
              title="Go to Home"
              onPress={onGoHome}
              variant="outline"
              style={styles.actionButton}
              testID={`${testID}-home`}
            />
          )}
        </View>

        {/* Success Additional Info */}
        {status === 'completed' && (
          <View style={styles.successInfo}>
            <Icon name="info" size={16} color="#4CAF50" />
            <Text style={styles.successInfoText}>
              You will receive an order confirmation via email and SMS shortly.
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  successInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  successInfoText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
});

export default PaymentStatus;
 
