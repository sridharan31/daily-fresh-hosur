 // app/hooks/usePayment.ts
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import paymentService from '../../lib/services/api/paymentService';
import paymentGateway from '../../lib/services/payment/paymentGateway';
import { Order } from '../../lib/types/order';
import { PaymentData, PaymentMethod, PaymentMethodDetails, PaymentMethodType, PaymentResult, PaymentStatus } from '../../lib/types/payment';
import { paymentConfig } from '../config/paymentConfig';

interface PaymentState {
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  lastTransaction: PaymentResult | null;
}

interface UsePaymentReturn extends PaymentState {
  // Payment methods
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'> & {
    type: PaymentMethodType;
    name: string;
    isDefault?: boolean;
    details?: PaymentMethodDetails;
  }) => Promise<PaymentMethod>;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => Promise<PaymentMethod>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  setSelectedMethod: (method: PaymentMethod) => void;
  setAsDefaultMethod: (methodId: string) => Promise<void>;
  
  // Payment processing
  processPayment: (order: Order, paymentData?: Partial<PaymentData>) => Promise<PaymentResult>;
  verifyPayment: (paymentId: string) => Promise<boolean>;
  refundPayment: (paymentId: string, amount?: number) => Promise<boolean>;
  
  // Gateway specific
  initializeStripe: (amount: number) => Promise<string>; // Returns client secret
  initializeRazorpay: (amount: number, orderId: string) => Promise<any>;
  initializePayPal: (amount: number) => Promise<string>;
  
  // Utility methods
  validatePaymentData: (data: PaymentData) => boolean;
  getPaymentMethodIcon: (type: string) => string;
  formatAmount: (amount: number, currency?: string) => string;
  isPaymentMethodAvailable: (type: string) => boolean;
  clearError: () => void;
}

const usePayment = (): UsePaymentReturn => {
  const [state, setState] = useState<PaymentState>({
    paymentMethods: [],
    selectedMethod: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    lastTransaction: null,
  });

  const loadPaymentMethods = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const methods = await paymentService.getPaymentMethods();
      const defaultMethod = methods.find(method => method.isDefault);
      
      setState(prev => ({ 
        ...prev, 
        paymentMethods: methods,
        selectedMethod: defaultMethod || methods[0] || null,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to load payment methods',
        isLoading: false,
      }));
    }
  }, []);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'> & {
    type: PaymentMethodType;
    name: string;
    details?: PaymentMethodDetails;
  }): Promise<PaymentMethod> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const newMethod = await paymentService.addPaymentMethod(method);
      
      setState(prev => ({ 
        ...prev, 
        paymentMethods: [...prev.paymentMethods, newMethod],
        selectedMethod: newMethod.isDefault ? newMethod : prev.selectedMethod,
        isLoading: false,
      }));
      
      return newMethod;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to add payment method',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updatePaymentMethod = useCallback(async (methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedMethod = await paymentService.updatePaymentMethod(methodId, updates);
      
      setState(prev => ({ 
        ...prev, 
        paymentMethods: prev.paymentMethods.map(method => 
          method.id === methodId ? updatedMethod : method
        ),
        selectedMethod: prev.selectedMethod?.id === methodId ? updatedMethod : prev.selectedMethod,
        isLoading: false,
      }));
      
      return updatedMethod;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to update payment method',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const deletePaymentMethod = useCallback(async (methodId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await paymentService.deletePaymentMethod(methodId);
      
      setState(prev => {
        const filteredMethods = prev.paymentMethods.filter(method => method.id !== methodId);
        return {
          ...prev,
          paymentMethods: filteredMethods,
          selectedMethod: prev.selectedMethod?.id === methodId 
            ? filteredMethods[0] || null 
            : prev.selectedMethod,
          isLoading: false,
        };
      });
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to delete payment method',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const setSelectedMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({ ...prev, selectedMethod: method }));
  }, []);

  const setAsDefaultMethod = useCallback(async (methodId: string): Promise<void> => {
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      
      setState(prev => ({ 
        ...prev, 
        paymentMethods: prev.paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        })),
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to set default payment method',
      }));
      throw error;
    }
  }, []);

  const processPayment = useCallback(async (order: Order, paymentData?: Partial<PaymentData>): Promise<PaymentResult> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      if (!state.selectedMethod) {
        throw new Error('No payment method selected');
      }

      const data: PaymentData = {
        amount: order.finalAmount,
        currency: 'AED',
        orderId: order.id,
        customerId: order.userId,
        paymentMethodId: state.selectedMethod.id,
        gateway: paymentConfig.defaultGateway as any,
        ...paymentData,
      };

      const result = await paymentGateway.processPayment(data.gateway, data);
      
      const paymentResult: PaymentResult = {
        ...result,
        success: result.status === 'completed',
        timestamp: new Date().toISOString(),
        status: (result.status as PaymentStatus) || 'failed',
      };
      
      setState(prev => ({ 
        ...prev, 
        lastTransaction: paymentResult,
        isProcessing: false,
      }));
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      return paymentResult;
    } catch (error: any) {
      const errorMessage = error.message || 'Payment processing failed';
      const failedResult: PaymentResult = {
        success: false,
        error: errorMessage,
        status: 'failed',
        timestamp: new Date().toISOString(),
      };
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isProcessing: false,
        lastTransaction: failedResult,
      }));
      throw error;
    }
  }, [state.selectedMethod]);

  const verifyPayment = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      const isVerified = await paymentService.verifyPayment(paymentId);
      return isVerified;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Payment verification failed',
      }));
      return false;
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: string, amount?: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await paymentService.processRefund(paymentId, amount);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (success) {
        Alert.alert('Refund Processed', 'Your refund has been initiated and will be processed within 5-7 business days.');
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Refund processing failed',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const initializeStripe = useCallback(async (amount: number): Promise<string> => {
    try {
      const clientSecret = await paymentGateway.initializePayment('stripe', amount, 'AED');
      return clientSecret;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to initialize Stripe payment',
      }));
      throw error;
    }
  }, []);

  const initializeRazorpay = useCallback(async (amount: number, orderId: string): Promise<any> => {
    try {
      const options = await paymentGateway.initializePayment('razorpay', amount, 'AED');
      return {
        ...options,
        order_id: orderId,
        theme: paymentConfig.gateways.razorpay.theme,
      };
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to initialize Razorpay payment',
      }));
      throw error;
    }
  }, []);

  const initializePayPal = useCallback(async (amount: number): Promise<string> => {
    try {
      const paymentId = await paymentGateway.initializePayment('paypal', amount, 'USD');
      return paymentId;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to initialize PayPal payment',
      }));
      throw error;
    }
  }, []);

  const validatePaymentData = useCallback((data: PaymentData): boolean => {
    if (!data.amount || data.amount <= 0) return false;
    if (!data.currency) return false;
    if (!data.orderId) return false;
    if (!data.customerId) return false;
    if (!data.paymentMethodId) return false;
    if (!data.gateway) return false;
    
    // Check if amount is within limits
    if (data.amount < paymentConfig.minimumAmount || data.amount > paymentConfig.maximumAmount) {
      return false;
    }
    
    return true;
  }, []);

  const getPaymentMethodIcon = useCallback((type: string): string => {
    const method = paymentConfig.paymentMethods[type as keyof typeof paymentConfig.paymentMethods];
    return method?.icon || 'payment';
  }, []);

  const formatAmount = useCallback((amount: number, currency: string = 'AED'): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency,
    }).format(amount);
  }, []);

  const isPaymentMethodAvailable = useCallback((type: string): boolean => {
    const method = paymentConfig.paymentMethods[type as keyof typeof paymentConfig.paymentMethods];
    return method?.enabled || false;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setSelectedMethod,
    setAsDefaultMethod,
    processPayment,
    verifyPayment,
    refundPayment,
    initializeStripe,
    initializeRazorpay,
    initializePayPal,
    validatePaymentData,
    getPaymentMethodIcon,
    formatAmount,
    isPaymentMethodAvailable,
    clearError,
  };
};

export default usePayment;
