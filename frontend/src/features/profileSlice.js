import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    notificationsEnabled: true,
    smsEnabled: false,
    priorityType: 'chronic', // chronic, elderly, disabled, doctor
  },
  preferredHospitals: [
    { id: 1, name: 'Acıbadem Maslak Hastanesi' },
    { id: 2, name: 'American Hospital' }
  ],
  medicalHistory: [
    { id: 1, date: '12.01.2026', title: 'Nöroloji Kontrolü', status: 'Tamamlandı' },
    { id: 2, date: '05.11.2025', title: 'Kardiyoloji', status: 'Tamamlandı' }
  ],
  stats: {
    totalAppointments: 12,
    cancellationRate: 5,
    emergencyVisits: 3,
    trustScoreLevel: 1
  }
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addPreferredHospital: (state, action) => {
      state.preferredHospitals.push(action.payload);
    },
    removePreferredHospital: (state, action) => {
      state.preferredHospitals = state.preferredHospitals.filter(h => h.id !== action.payload);
    }
  }
});

export const { updatePreferences, addPreferredHospital, removePreferredHospital } = profileSlice.actions;
export default profileSlice.reducer;
