// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import resultsReducer from './resultsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    results: resultsReducer,
  },
});
