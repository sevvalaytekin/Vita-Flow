import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, Calendar, User, LogOut, Bell, Stethoscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import '../styles/main.css';

const DoctorLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="main-container">
      <header className="main-header" style={{ background: 'linear-gradient(135deg, #065f46, #047857)' }}>
        <div className="header-brand">
          <div className="logo-icon-small">
            <Stethoscope color="#10b981" size={24} />
          </div>
          <div>
            <h2>VitaFlow Doktor</h2>
            <p>Poliklinik Yönetimi</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.email || 'Doktor'}</span>
              <span className="user-role">Doktor</span>
            </div>
            <div className="avatar" style={{ background: '#10b981', color: '#065f46' }}>D</div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="main-content-wrapper">
        <aside className="main-sidebar">
          <nav className="sidebar-nav">
            <NavLink to="/doctor" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <LayoutDashboard size={20} />
              <span>Panelim</span>
            </NavLink>
            <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Users size={20} />
              <span>Hastalarım</span>
            </NavLink>
            <NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Calendar size={20} />
              <span>Randevu Takvimi</span>
            </NavLink>
            <NavLink to="/doctor/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <User size={20} />
              <span>Profilim</span>
            </NavLink>
          </nav>
          
          <div className="sidebar-footer">
            <div className="user-badge glass-panel" style={{ background: '#ecfdf5', border: 'none' }}>
              <Stethoscope size={16} color="#059669" />
              <div>
                <strong style={{ color: '#065f46' }}>Doktor</strong>
                <span>Poliklinik Yetkisi</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
