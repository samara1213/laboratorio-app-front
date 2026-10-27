// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Redux solo guarda la sesión; los datos del servidor van en TanStack Query
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
