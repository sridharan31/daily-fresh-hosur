 import apiClient from './apiClient';

const deliveryService = {
  // Get available delivery slots
  getAvailableSlots: async (date: string, area: string) => {
    return await apiClient.get(`/delivery/slots?date=${date}&area=${area}`);
  },

  // Book a delivery slot
  bookSlot: async (slotData: any) => {
    return await apiClient.post('/delivery/book-slot', slotData);
  },

  // Get delivery areas
  getDeliveryAreas: async () => {
    return await apiClient.get('/delivery/areas');
  },

  // Check delivery availability
  checkDeliveryAvailability: async (pincode: string) => {
    return await apiClient.get(`/delivery/check-availability/${pincode}`);
  },

  // Get delivery charges
  getDeliveryCharges: async (area: string, slotType: string) => {
    return await apiClient.get(`/delivery/charges?area=${area}&slotType=${slotType}`);
  },

  // Track delivery
  trackDelivery: async (orderId: string) => {
    return await apiClient.get(`/delivery/track/${orderId}`);
  },

  // Update delivery status (admin)
  updateDeliveryStatus: async (orderId: string, status: string) => {
    return await apiClient.patch(`/delivery/status/${orderId}`, {status});
  },

  // Get slot utilization (admin)
  getSlotUtilization: async (date: string) => {
    return await apiClient.get(`/admin/delivery/slot-utilization?date=${date}`);
  },

  // Create/update slot configuration (admin)
  updateSlotConfiguration: async (slotConfig: any) => {
    return await apiClient.post('/admin/delivery/slot-configuration', slotConfig);
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string) => {
    return await apiClient.delete(`/delivery/booking/${bookingId}`);
  },

  // Check slot availability
  checkSlotAvailability: async (slotId: string, date: string) => {
    return await apiClient.get(`/delivery/slot-availability?slotId=${slotId}&date=${date}`);
  },

  // Get slot capacity
  getSlotCapacity: async (slotId: string, date: string) => {
    return await apiClient.get(`/delivery/slot-capacity?slotId=${slotId}&date=${date}`);
  },

  // Address management
  getDeliveryAddresses: async () => {
    return await apiClient.get('/user/addresses');
  },

  saveAddress: async (addressData: any) => {
    if (addressData.id) {
      return await apiClient.put(`/user/addresses/${addressData.id}`, addressData);
    } else {
      return await apiClient.post('/user/addresses', addressData);
    }
  },

  validateAddress: async (coordinates: {latitude: number; longitude: number}) => {
    return await apiClient.post('/delivery/validate-address', coordinates);
  },
};

export default deliveryService;
