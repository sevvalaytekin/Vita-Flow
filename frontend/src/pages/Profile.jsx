import React from 'react';
import { useSelector } from 'react-redux';
import { Settings, HeartPulse, BarChart3, Hospital, BellRing } from 'lucide-react';
import '../styles/profile.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth) || { user: { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'Öncelik: Kronik Hasta' } };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Profilim</h1>
      </div>

      <div className="profile-grid">
        {/* Sol Kolon - Kişisel Bilgiler */}
        <div className="profile-main glass-panel">
          <div className="profile-header">
            <div className="profile-avatar-large">{user?.initials || 'AY'}</div>
            <div>
              <h2>{user?.name || 'Ahmet Yılmaz'}</h2>
              <p>{user?.email || 'ahmet@example.com'}</p>
              <span className="priority-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                {user?.role || 'Öncelik: Kronik Hasta'}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <h3><Settings size={18} /> Hesap Ayarları</h3>
            <div className="auth-form" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Öncelik Durumu</label>
                <select className="styled-select" defaultValue="chronic">
                  <option value="doctor">Doktorun belirlediği öncelik</option>
                  <option value="chronic">Kronik Hasta</option>
                  <option value="elderly">65 Yaş Üstü</option>
                  <option value="disabled">Engelli</option>
                </select>
              </div>
              <button className="btn-outline">Bilgileri Güncelle</button>
            </div>
          </div>

          <div className="profile-section">
            <h3><BellRing size={18} /> Bildirim Ayarları</h3>
            <div className="form-options" style={{ marginTop: '1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>İptal edilen randevu bildirimlerini al (Öncelikli slotlar)</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>SMS ile bilgilendirme al</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - İstatistikler & Geçmiş */}
        <div className="profile-sidebar">
          <div className="glass-panel profile-section">
            <h3><Hospital size={18} /> Hastane Tercihleri</h3>
            <p className="cn-desc">Sistem randevu önerirken bu hastanelere öncelik verecektir.</p>
            <div className="demo-list">
              <p>1. Acıbadem Maslak Hastanesi</p>
              <p>2. American Hospital</p>
            </div>
            <button className="btn-outline btn-block" style={{ marginTop: '1rem' }}>+ Hastane Ekle</button>
          </div>

          <div className="glass-panel profile-section">
            <h3><BarChart3 size={18} /> Kullanım İstatistikleri</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>12</h4>
                <p>Toplam Randevu</p>
              </div>
              <div className="stat-box">
                <h4>%5</h4>
                <p>İptal Oranı</p>
              </div>
              <div className="stat-box">
                <h4>3</h4>
                <p>Acil Başvurusu</p>
              </div>
              <div className="stat-box">
                <h4>1. Seviye</h4>
                <p>Güven Skoru</p>
              </div>
            </div>
          </div>

          <div className="glass-panel profile-section">
            <h3><HeartPulse size={18} /> Tıbbi Geçmiş</h3>
            <div className="demo-list">
              <p><strong>12.01.2026</strong> - Nöroloji Kontrolü (Tamamlandı)</p>
              <p><strong>05.11.2025</strong> - Kardiyoloji (Tamamlandı)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
