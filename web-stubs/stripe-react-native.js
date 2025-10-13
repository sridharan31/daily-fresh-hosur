// web-stubs/stripe-react-native.js

// Stub components
const StubComponent = () => {
  console.warn('Stripe React Native is not supported on web. Use @stripe/stripe-js instead.');
  return null;
};

// Export all Stripe components as stubs
export const StripeProvider = ({ children }) => children;
export const CardField = StubComponent;
export const CardForm = StubComponent;
export const ApplePayButton = StubComponent;
export const GooglePayButton = StubComponent;
export const AuBECSDebitForm = StubComponent;
export const StripeContainer = StubComponent;

// Export hook stubs
export const useStripe = () => ({
  confirmPayment: async () => ({ error: { message: 'Stripe not supported on web' } }),
  createPaymentMethod: async () => ({ error: { message: 'Stripe not supported on web' } }),
  retrievePaymentIntent: async () => ({ error: { message: 'Stripe not supported on web' } }),
  confirmSetupIntent: async () => ({ error: { message: 'Stripe not supported on web' } }),
  createTokenForCVCUpdate: async () => ({ error: { message: 'Stripe not supported on web' } }),
});

export const useConfirmPayment = () => ({
  confirmPayment: async () => ({ error: { message: 'Stripe not supported on web' } }),
});

export const useConfirmSetupIntent = () => ({
  confirmSetupIntent: async () => ({ error: { message: 'Stripe not supported on web' } }),
});

export const initStripe = async () => {
  console.warn('Stripe React Native is not supported on web');
};

export default {
  StripeProvider,
  CardField,
  CardForm,
  ApplePayButton,
  GooglePayButton,
  AuBECSDebitForm,
  StripeContainer,
  useStripe,
  useConfirmPayment,
  useConfirmSetupIntent,
  initStripe,
};