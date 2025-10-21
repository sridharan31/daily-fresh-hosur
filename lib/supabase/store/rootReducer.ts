import { combineReducers } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import productReducer from './productSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  orders: orderReducer,
  admin: adminReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;