import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Helper: Generate a stable device ID for this browser
function getDeviceId() {
  let deviceId = localStorage.getItem('vitaflow_device_id');
  if (!deviceId) {
    // Generate a UUID-like device ID (min 10 chars, alphanumeric + dash)
    deviceId = 'web-' + crypto.randomUUID();
    localStorage.setItem('vitaflow_device_id', deviceId);
  }
  return deviceId;
}

// Helper: Extract human-readable error from backend response
function extractErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (!data) {
    if (error.code === 'ERR_NETWORK') return 'Sunucuya bağlanılamıyor. Backend çalışıyor mu?';
    return fallback;
  }
  // Backend returns { code, message, errors: { field: "msg" }, timestamp }
  if (data.errors && typeof data.errors === 'object') {
    const fieldErrors = Object.entries(data.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(', ');
    return `${data.message || 'Hata'} — ${fieldErrors}`;
  }
  if (data.message) return data.message;
  if (typeof data === 'string') return data;
  return fallback;
}

// Async Thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const payload = {
        tenantCode: 'DEFAULT',
        deviceId: getDeviceId(),
        ...credentials
      };
      const response = await api.post('/v1/auth/login', payload);
      return response.data;
    } catch (error) {
      const msg = extractErrorMessage(error, 'Giriş işlemi başarısız');
      return rejectWithValue(msg);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        tenantCode: 'DEFAULT',
        ...userData
      };
      const response = await api.post('/v1/identity/register', payload);
      return response.data;
    } catch (error) {
      const msg = extractErrorMessage(error, 'Kayıt işlemi başarısız');
      return rejectWithValue(msg);
    }
  }
);

// Restore user from localStorage on page refresh
function getPersistedUser() {
  try {
    const raw = localStorage.getItem('vitaflow_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const initialState = {
  user: getPersistedUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

// Helper: Get the correct redirect path based on user role
export function getRoleBasedRedirect(roles) {
  if (!roles || roles.length === 0) return '/emergency-services';
  if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) return '/admin';
  if (roles.includes('ROLE_DOCTOR')) return '/doctor';
  return '/emergency-services';
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('vitaflow_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Backend returns: { accessToken, refreshToken, tokenType }
        state.token = action.payload.accessToken;
        
        // Decode user info from JWT payload
        try {
          const base64Payload = action.payload.accessToken.split('.')[1];
          // Properly decode UTF-8 characters (Turkish chars etc.) from Base64
          const decodedPayload = new TextDecoder().decode(
            new Uint8Array(atob(base64Payload).split('').map(c => c.charCodeAt(0)))
          );
          const payload = JSON.parse(decodedPayload);
          
          let roleText = 'Kullanıcı';
          
          // LocalStorage'dan kayıt sırasındaki önceliği kontrol et
          const savedPriority = localStorage.getItem(`vitaflow_priority_${payload.email}`);
          if (savedPriority === 'chronic') roleText = 'Öncelik: Kronik Hasta';
          else if (savedPriority === 'elderly') roleText = 'Öncelik: 65 Yaş Üstü';
          else if (savedPriority === 'disabled') roleText = 'Öncelik: Engelli';
          else if (savedPriority === 'doctor') roleText = 'Doktor Önceliği';
          else if (savedPriority === 'none') roleText = 'Standart Kullanıcı';
          
          if (payload.roles?.includes('ROLE_ADMIN') || payload.roles?.includes('ROLE_SUPER_ADMIN')) {
            roleText = 'Yönetici';
          } else if (payload.roles?.includes('ROLE_DOCTOR')) {
            roleText = 'Doktor';
          } else if (payload.roles?.includes('ROLE_CHRONIC_PATIENT')) {
            roleText = 'Öncelik: Kronik Hasta';
          } else if (payload.roles?.includes('ROLE_ELDERLY')) {
            roleText = 'Öncelik: 65 Yaş Üstü';
          } else if (payload.roles?.includes('ROLE_DISABLED')) {
            roleText = 'Öncelik: Engelli';
          }

          const fullName = payload.username || payload.email.split('@')[0];
          const nameParts = fullName.split(' ');
          const initials = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
            : fullName.substring(0, 2).toUpperCase();

          state.user = {
            id: payload.sub,
            email: payload.email,
            name: fullName,
            initials: initials,
            role: roleText,
            tenant: payload.tenant,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
          };
        } catch {
          state.user = { name: 'Kullanıcı', initials: 'KU', role: 'Standart Kullanıcı', email: 'user', roles: ['ROLE_USER'], permissions: [] };
        }
        
        if (state.token) {
          localStorage.setItem('token', state.token);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
          localStorage.setItem('vitaflow_user', JSON.stringify(state.user));
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
        // Registration successful, usually redirects to login
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
