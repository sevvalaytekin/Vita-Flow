import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import appointmentReducer from './appointmentSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointment: appointmentReducer,
    profile: profileReducer,
  },
});

store.subscribe(() => {
  localStorage.setItem('vitaflow_appointments', JSON.stringify(store.getState().appointment));
});
