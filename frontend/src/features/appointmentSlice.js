import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  cancelledAppointments: [],
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
    setCancelledAppointments: (state, action) => {
      state.cancelledAppointments = action.payload;
    },
    takeAppointment: (state, action) => {
      const id = action.payload;
      const appt = state.cancelledAppointments.find(a => a.id === id);
      if (appt) {
        state.appointments.push(appt);
        state.cancelledAppointments = state.cancelledAppointments.filter(a => a.id !== id);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setAppointments, setCancelledAppointments, takeAppointment, setLoading, setError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
