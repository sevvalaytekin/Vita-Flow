import { createSlice } from '@reduxjs/toolkit';

const savedState = JSON.parse(localStorage.getItem('vitaflow_appointments') || 'null');

const initialState = savedState || {
  appointments: [],
  cancelledAppointments: [],
  hasClaimedPriority: false,
  isLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    setCancelledAppointments: (state, action) => {
      state.cancelledAppointments = action.payload;
    },
    takeAppointment: (state, action) => {
      const { id, userId } = action.payload;
      const appt = state.cancelledAppointments.find(a => a.id === id);
      if (appt) {
        state.appointments.push({ ...appt, userId });
        state.cancelledAppointments = state.cancelledAppointments.filter(a => a.id !== id);
        state.hasClaimedPriority = true;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { setAppointments, addAppointment, setCancelledAppointments, takeAppointment, setLoading, setError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
