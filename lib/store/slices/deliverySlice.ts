 import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import deliveryService from '../../services/api/deliveryService';
import { ApiResponse } from '../../types/api';
import { DeliveryAddress, DeliverySlot, DeliveryState, DeliveryZone } from '../../types/delivery';

// Async thunks
export const fetchDeliverySlots = createAsyncThunk<
  DeliverySlot[],
  {date: string; addressId?: string},
  {rejectValue: string}
>(
  'delivery/fetchDeliverySlots',
  async ({date, addressId}, {rejectWithValue}) => {
    try {
      // Use addressId if provided, otherwise use a default area or empty string
      const area = addressId || 'default';
      const response: ApiResponse<DeliverySlot[]> = await deliveryService.getAvailableSlots(date, area);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch delivery slots');
    }
  }
);

export const fetchDeliveryAddresses = createAsyncThunk<
  DeliveryAddress[],
  void,
  {rejectValue: string}
>(
  'delivery/fetchDeliveryAddresses',
  async (_, {rejectWithValue}) => {
    try {
      const response: ApiResponse<DeliveryAddress[]> = await deliveryService.getDeliveryAddresses();
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch delivery addresses');
    }
  }
);

export const saveDeliveryAddress = createAsyncThunk<
  DeliveryAddress,
  Partial<DeliveryAddress>,
  {rejectValue: string}
>(
  'delivery/saveDeliveryAddress',
  async (addressData, {rejectWithValue}) => {
    try {
      const response: ApiResponse<DeliveryAddress> = await deliveryService.saveAddress(addressData);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save delivery address');
    }
  }
);

export const validateDeliveryAddress = createAsyncThunk<
  {isValid: boolean; zone?: DeliveryZone; message?: string},
  {latitude: number; longitude: number},
  {rejectValue: string}
>(
  'delivery/validateDeliveryAddress',
  async (coordinates, {rejectWithValue}) => {
    try {
      const response = await deliveryService.validateAddress(coordinates);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to validate address');
    }
  }
);

// Initial state
const initialState: DeliveryState = {
  availableSlots: [],
  addresses: [],
  selectedSlot: null,
  selectedAddress: null,
  selectedDate: null,
  deliveryAreas: [],
  deliveryZones: [],
  isLoading: false,
  loading: false,
  slotsLoading: false,
  addressValidation: null,
  error: null,
  estimatedDeliveryTime: null,
  deliveryCharge: 0,
};

// Slice
const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedSlot: (state, action: PayloadAction<DeliverySlot | null>) => {
      state.selectedSlot = action.payload;
    },
    setSelectedAddress: (state, action: PayloadAction<DeliveryAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    clearDeliverySlots: (state) => {
      state.availableSlots = [];
    },
    clearAddressValidation: (state) => {
      state.addressValidation = null;
    },
    setDeliveryCharge: (state, action: PayloadAction<number>) => {
      state.deliveryCharge = action.payload;
    },
    setEstimatedDeliveryTime: (state, action: PayloadAction<string>) => {
      state.estimatedDeliveryTime = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
      if (state.selectedAddress?.id === action.payload) {
        state.selectedAddress = null;
      }
    },
    updateSlotAvailability: (state, action: PayloadAction<{slotId: string; isAvailable: boolean}>) => {
      const slot = state.availableSlots.find(s => s.id === action.payload.slotId);
      if (slot) {
        slot.available = action.payload.isAvailable;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch delivery slots
      .addCase(fetchDeliverySlots.pending, (state) => {
        state.slotsLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliverySlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchDeliverySlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.error = action.payload || 'Failed to fetch delivery slots';
      })
      // Fetch delivery addresses
      .addCase(fetchDeliveryAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        // Set default address if exists
        const defaultAddress = action.payload.find(addr => addr.isDefault);
        if (defaultAddress && !state.selectedAddress) {
          state.selectedAddress = defaultAddress;
        }
      })
      .addCase(fetchDeliveryAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch delivery addresses';
      })
      // Save delivery address
      .addCase(saveDeliveryAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDeliveryAddress.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (existingIndex >= 0) {
          state.addresses[existingIndex] = action.payload;
        } else {
          state.addresses.push(action.payload);
        }
        // Set as selected if it's default
        if (action.payload.isDefault) {
          state.selectedAddress = action.payload;
        }
      })
      .addCase(saveDeliveryAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save delivery address';
      })
      // Validate delivery address
      .addCase(validateDeliveryAddress.pending, (state) => {
        state.loading = true;
        state.addressValidation = null;
      })
      .addCase(validateDeliveryAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressValidation = action.payload;
      })
      .addCase(validateDeliveryAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to validate address';
      });
  },
});

export const {
  setSelectedSlot,
  setSelectedAddress,
  clearDeliverySlots,
  clearAddressValidation,
  setDeliveryCharge,
  setEstimatedDeliveryTime,
  clearError,
  deleteAddress,
  updateSlotAvailability,
} = deliverySlice.actions;

export default deliverySlice.reducer;
