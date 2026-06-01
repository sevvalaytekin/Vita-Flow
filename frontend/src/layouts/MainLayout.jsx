import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, Ambulance, CalendarDays, User, LogOut, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import '../styles/main.css';

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="main-container">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-brand">
          <div className="logo-icon-small">
            <Activity color="#0ea5e9" size={24} />
          </div>
          <div>
            <h2>VitaFlow</h2>
            <p>Akıllı Sağlık Yönetimi</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="badge">2</span>
          </button>
          
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <div className="avatar">{user?.initials}</div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="main-content-wrapper">
        {/* Sidebar */}
        <aside className="main-sidebar">
          <nav className="sidebar-nav">
            <NavLink to="/emergency-services" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Ambulance size={20} />
              <span>Acil Servisler</span>
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <CalendarDays size={20} />
              <span>Randevular</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <User size={20} />
              <span>Profilim</span>
            </NavLink>
          </nav>
          
          <div className="sidebar-footer">
            <div className="user-badge glass-panel">
              <User size={16} color="#0ea5e9" />
              <div>
                <strong>{user?.name || 'Kullanıcı'}</strong>
                <span>{user?.role || 'Öncelik Seviye: 2'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
