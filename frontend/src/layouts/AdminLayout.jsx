import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Building2, Users, BarChart3, User, LogOut, Bell, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import '../styles/main.css';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="main-container">
      <header className="main-header" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
        <div className="header-brand">
          <div className="logo-icon-small">
            <Shield color="#f59e0b" size={24} />
          </div>
          <div>
            <h2>VitaFlow Admin</h2>
            <p>Sistem Yönetim Paneli</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="badge">5</span>
          </button>
          
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user?.email || 'Admin'}</span>
              <span className="user-role">Sistem Yöneticisi</span>
            </div>
            <div className="avatar" style={{ background: '#f59e0b', color: '#1e293b' }}>A</div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="main-content-wrapper">
        <aside className="main-sidebar">
          <nav className="sidebar-nav">
            <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <LayoutDashboard size={20} />
              <span>Genel Bakış</span>
            </NavLink>
            <NavLink to="/admin/hospitals" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Building2 size={20} />
              <span>Hastaneler</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Users size={20} />
              <span>Kullanıcılar</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <BarChart3 size={20} />
              <span>Raporlar</span>
            </NavLink>
            <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <User size={20} />
              <span>Profilim</span>
            </NavLink>
          </nav>
          
          <div className="sidebar-footer">
            <div className="user-badge glass-panel" style={{ background: '#fef3c7', border: 'none' }}>
              <Shield size={16} color="#d97706" />
              <div>
                <strong style={{ color: '#92400e' }}>Yönetici</strong>
                <span>Tam Yetki</span>
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

export default AdminLayout;
