// Web stub for @stripe/stripe-react-native
import React from 'react';

// Mock all Stripe hooks
export const useStripe = () => ({
  initPaymentSheet: async () => ({ error: null }),
  presentPaymentSheet: async () => ({ error: null }),
  createPaymentMethod: async () => ({ error: null }),
  handleCardAction: async () => ({ error: null }),
  confirmPayment: async () => ({ error: null }),
  createToken: async () => ({ error: null }),
  handleNextAction: async () => ({ error: null }),
});

export const useConfirmPayment = () => ({
  confirmPayment: async () => ({ error: null }),
  loading: false,
});

export const useConfirmSetupIntent = () => ({
  confirmSetupIntent: async () => ({ error: null }),
  loading: false,
});

// Mock all Stripe components
export const CardField = () => null;
export const CardForm = () => null;
export const AuBECSDebitForm = () => null;
export const GooglePayButton = () => null;
export const ApplePayButton = () => null;
export const PlatformPayButton = () => null;

// Mock the StripeProvider
export const StripeProvider = ({ children }) => React.createElement(React.Fragment, null, children);

// Mock native specifications
export const NativeStripeSdk = null;
export const NativeStripeModule = null;
export const createNativeComponent = () => null;

// Additional exports
export const initStripe = async () => ({ error: null });
export const presentNativePaymentSheet = async () => ({ error: null });
export const confirmPaymentSheetPayment = async () => ({ error: null });

export default {
  useStripe,
  useConfirmPayment,
  useConfirmSetupIntent,
  CardField,
  CardForm,
  AuBECSDebitForm,
  GooglePayButton,
  ApplePayButton,
  PlatformPayButton,
  StripeProvider,
  initStripe,
  presentNativePaymentSheet,
  confirmPaymentSheetPayment,
};
