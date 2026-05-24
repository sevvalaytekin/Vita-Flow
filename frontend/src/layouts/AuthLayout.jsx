import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';
import '../styles/auth.css';

const AuthLayout = () => {
  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-info fade-in">
          <div className="auth-logo">
            <div className="logo-icon">
              <Activity color="#0ea5e9" size={32} />
            </div>
            <div>
              <h1>VitaFlow</h1>
              <p>Akıllı Sağlık Yönetimi</p>
            </div>
          </div>

          <div className="auth-features">
            <div className="feature-card glass-panel">
              <h3>🚑 Acil Servis Takibi</h3>
              <p>40 km² alanda tüm acil servislerin anlık doluluk durumu, mesafe ve trafik optimizasyonu</p>
            </div>
            <div className="feature-card glass-panel">
              <h3>🏥 Akıllı Randevu</h3>
              <p>Poliklinik kapasite, doktor uzmanlık, mesafe ve trafik bazlı optimize randevu sistemi</p>
            </div>
            <div className="feature-card glass-panel">
              <h3>⚡ Öncelik Sistemi</h3>
              <p>Kronik hastalar, 65+ yaş, engelliler ve doktor önceliğine göre akıllı sıralama</p>
            </div>
          </div>
        </div>

        <div className="auth-form-wrapper fade-in">
          <Outlet />
          <div className="auth-footer">
            <p>© 2026 VitaFlow. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
