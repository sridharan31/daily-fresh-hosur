import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

// Platform detection
const isWeb = typeof window !== 'undefined' && window.document;

// Import reducers
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import deliveryReducer from './slices/deliverySlice';
import orderReducer from './slices/orderSlice';
import productReducer from './slices/productSlice';
import userReducer from './slices/userSlice';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  product: productReducer,
  order: orderReducer,
  delivery: deliveryReducer,
  user: userReducer,
  admin: adminReducer,
});

// For web, use the rootReducer directly without persistence
// For native, apply persistence with AsyncStorage
let finalReducer: any = rootReducer;

if (!isWeb) {
  // Only setup persistence for native platforms
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const persistConfig = {
      key: 'root',
      storage: AsyncStorage,
      whitelist: ['auth', 'cart'],
    };
    finalReducer = persistReducer(persistConfig, rootReducer);
  } catch (error) {
    console.warn('AsyncStorage not available, persistence disabled');
  }
}

// Configure store
export const store = configureStore({
  reducer: finalReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: isWeb ? undefined : {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['persist'],
      },
      immutableCheck: isWeb ? undefined : {
        ignoredPaths: ['persist'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Only create persistor for native platforms
export const persistor = !isWeb && finalReducer !== rootReducer ? persistStore(store) : null;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
