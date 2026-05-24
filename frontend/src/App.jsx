import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmergencyServices from './pages/EmergencyServices';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

import { getRoleBasedRedirect } from './features/authSlice';

// Route Guard — redirects to login if not authenticated
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (allowedRoles && user?.roles) {
    const hasRole = user.roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      // Redirect to user's own dashboard
      const correctPath = getRoleBasedRedirect(user.roles);
      return <Navigate to={correctPath} replace />;
    }
  }
  
  return children;
};

// Smart root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const path = getRoleBasedRedirect(user?.roles);
  return <Navigate to={path} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Smart Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hospitals" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<Profile />} />
        </Route>

        {/* Doctor Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorDashboard />} />
          <Route path="/doctor/schedule" element={<DoctorDashboard />} />
          <Route path="/doctor/profile" element={<Profile />} />
        </Route>

        {/* User Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['ROLE_USER']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/emergency-services" element={<EmergencyServices />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/new-appointment" element={<NewAppointment />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
