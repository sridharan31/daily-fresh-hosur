import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import { authMiddleware } from './middleware/authMiddleware';
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

// Check if we're on web and setup appropriate storage
const isWeb = typeof window !== 'undefined';

let persistedReducer: any;
let persistor: any;

if (isWeb) {
  // On web, use localStorage for persistence
  try {
    const storage = {
      getItem: (key: string) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      }
    };

    const persistConfig = {
      key: 'root',
      storage,
      whitelist: ['auth', 'cart'], // Only persist auth and cart
    };
    persistedReducer = persistReducer(persistConfig, rootReducer);
    
    // We'll create persistor after store is created
  } catch (error) {
    console.warn('Web persistence setup failed, using non-persisted store:', error);
    persistedReducer = rootReducer;
    persistor = null;
  }
} else {
  // On native, use normal persistence
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const persistConfig = {
      key: 'root',
      storage: AsyncStorage,
      whitelist: ['auth', 'cart'], // Only persist auth and cart
    };
    persistedReducer = persistReducer(persistConfig, rootReducer);
  } catch {
    // Fallback to no persistence if AsyncStorage fails
    persistedReducer = rootReducer;
    persistor = null;
  }
}

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).prepend(authMiddleware.middleware),
});

// Create persistor for both web and native when persistence is enabled
if (!persistor) {
  try {
    persistor = persistStore(store);
  } catch (error) {
    console.warn('Failed to create persistor:', error);
    persistor = null;
  }
}

export { persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
