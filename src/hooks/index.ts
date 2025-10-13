// src/hooks/index.ts
export { useAdmin } from './useAdmin';
export { useAuth } from './useAuth';
export { useCart } from './useCart';
export { useCart as useCartNew } from './useCartNew';
export { useDeliverySlots } from './useDeliverySlots';
export { useLocation } from './useLocation';
export { useNotifications } from './useNotifications';
export { useOrders } from './useOrders';
export { usePayment } from './usePayment';
export { useReviews } from './useReviews';
export { useUser } from './useUser';


// Default export to satisfy Expo Router (this file should not be treated as a route)
export default function RouteNotFound() { return null; }
