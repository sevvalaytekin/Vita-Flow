import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Bell, ShieldAlert, BarChart2, MapPin, CalendarClock } from 'lucide-react';
import '../styles/profile.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth) || {};
  
  // Güvenli fallback değerleri
  const safeUser = {
    name: user?.name || 'Ahmet Yılmaz',
    email: user?.email || 'ahmet.yilmaz@email.com',
    role: user?.role || 'Öncelik: Kronik Hasta',
    tcNo: '12345678901',
    phone: '+90 555 123 4567',
    address: 'Maslak, Sarıyer, İstanbul'
  };

  const [priorityStatus, setPriorityStatus] = useState('chronic');

  const getPriorityLevel = (role) => {
    if (role.includes('Kronik')) return 'Seviye 2';
    if (role.includes('65')) return 'Seviye 1';
    if (role.includes('Engelli')) return 'Seviye 1';
    if (role.includes('Doktor')) return 'Seviye 1';
    return 'Standart';
  };

  const getCleanRole = (role) => {
    return role.replace('Öncelik: ', '');
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Kullanıcı Profili</h1>
          <p className="page-subtitle">Kişisel bilgilerinizi ve tercihlerinizi yönetin</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* SOL KOLON */}
        <div className="profile-main-col">
          
          {/* Kişisel Bilgiler */}
          <div className="profile-card">
            <div className="profile-card-header">
              <User className="profile-icon" size={20} />
              <h3>Kişisel Bilgiler</h3>
            </div>
            
            <div className="info-grid">
              <div className="info-group">
                <label>Ad Soyad</label>
                <input type="text" className="info-input" defaultValue={safeUser.name} />
              </div>
              <div className="info-group">
                <label>TC Kimlik No</label>
                <input type="text" className="info-input" defaultValue={safeUser.tcNo} />
              </div>
              <div className="info-group">
                <label>E-posta</label>
                <input type="email" className="info-input" defaultValue={safeUser.email} />
              </div>
              <div className="info-group">
                <label>Telefon</label>
                <input type="tel" className="info-input" defaultValue={safeUser.phone} />
              </div>
              <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                <label>Adres</label>
                <input type="text" className="info-input" defaultValue={safeUser.address} />
              </div>
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          {/* Öncelik Durumu */}
          <div className="profile-card">
            <div className="profile-card-header">
              <ShieldAlert className="profile-icon purple" size={20} />
              <h3>Öncelik Durumu</h3>
            </div>

            <div className="priority-highlight-box">
              <div>
                <p>Mevcut Öncelik Seviyeniz</p>
                <h4>{getCleanRole(safeUser.role)}</h4>
              </div>
              <div className="priority-badge-pill">
                {getPriorityLevel(safeUser.role)}
              </div>
            </div>

            <div className="info-group" style={{ marginTop: '0.5rem' }}>
              <label>Öncelik Durumunu Güncelle</label>
              <select 
                className="styled-select" 
                value={priorityStatus}
                onChange={(e) => setPriorityStatus(e.target.value)}
                style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
              >
                <option value="none">Yok (Standart Kullanıcı)</option>
                <option value="chronic">Kronik Hasta (Seviye 2)</option>
                <option value="elderly">65 Yaş Üstü (Seviye 1)</option>
                <option value="disabled">Engelli (Seviye 1)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                * Öncelik güncellemesi için doktor onayı gereklidir
              </span>
            </div>

            <div className="priority-info-box">
              <h5><ShieldAlert size={16} color="#6b7280" /> Öncelik Sistemi Bilgilendirmesi</h5>
              <ul>
                <li>İptal edilen randevular önce size bildirilir</li>
                <li>Acil servislerde daha hızlı değerlendirme</li>
                <li>Randevu iptallerinde öncelikli bildirim</li>
                <li>Özel sağlık takibi ve hatırlatmalar</li>
              </ul>
            </div>
          </div>

          {/* Tercih Edilen Hastaneler */}
          <div className="profile-card">
            <div className="profile-card-header">
              <MapPin className="profile-icon green" size={20} />
              <h3>Tercih Edilen Hastaneler</h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '-0.5rem 0 0.5rem 0' }}>
              Randevularınızda bu hastaneler öncelikli olarak önerilecektir
            </p>

            <div className="hospital-list">
              <div className="hospital-list-item">
                <span>Acıbadem Maslak</span>
                <button className="btn-link-remove">Kaldır</button>
              </div>
              <div className="hospital-list-item">
                <span>American Hospital</span>
                <button className="btn-link-remove">Kaldır</button>
              </div>
            </div>

            <button className="btn-outline" style={{ marginTop: '0.5rem', width: '100%', borderRadius: '8px' }}>
              Hastane Ekle
            </button>
          </div>

          {/* Tıbbi Geçmiş */}
          <div className="profile-card">
            <div className="profile-card-header">
              <CalendarClock className="profile-icon orange" size={20} />
              <h3>Tıbbi Geçmiş</h3>
            </div>

            <div className="history-list">
              <div className="history-item">
                <div className="history-details">
                  <h5>Acıbadem Maslak</h5>
                  <p>Kardiyoloji</p>
                  <p>Kontrol Muayenesi</p>
                </div>
                <div className="history-date">2026-01-15</div>
              </div>
              <div className="history-item">
                <div className="history-details">
                  <h5>American Hospital</h5>
                  <p>Nöroloji</p>
                  <p>Baş Ağrısı</p>
                </div>
                <div className="history-date">2025-12-20</div>
              </div>
              <div className="history-item">
                <div className="history-details">
                  <h5>Memorial Şişli</h5>
                  <p>Ortopedi</p>
                  <p>Fizik Tedavi</p>
                </div>
                <div className="history-date">2025-11-10</div>
              </div>
            </div>
          </div>

        </div>

        {/* SAĞ KOLON */}
        <div className="profile-side-col">
          
          {/* Bildirim Ayarları */}
          <div className="profile-card">
            <div className="profile-card-header">
              <Bell className="profile-icon yellow" size={20} />
              <h3>Bildirim Ayarları</h3>
            </div>

            <div className="notification-list">
              <div className="notification-item">
                <div className="notification-text">
                  <h5>Randevu Hatırlatmaları</h5>
                  <p>Randevularınız öncesi bildirim</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-text">
                  <h5>İptal Bildirimleri</h5>
                  <p>İptal edilen randevular için</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-text">
                  <h5>Acil Uyarılar</h5>
                  <p>Önemli sağlık uyarıları</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-text">
                  <h5>Sağlık İpuçları</h5>
                  <p>Günlük sağlık önerileri</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Kullanım İstatistikleri */}
          <div className="profile-card">
            <div className="profile-card-header">
              <BarChart2 className="profile-icon" size={20} />
              <h3>Kullanım İstatistikleri</h3>
            </div>

            <div className="stats-list">
              <div className="stat-row">
                <div className="stat-label-row">
                  <span>Toplam Randevu</span>
                  <span>24</span>
                </div>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill blue" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-label-row">
                  <span>Tamamlanan</span>
                  <span>18</span>
                </div>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill green" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-label-row">
                  <span>İptal Edilen</span>
                  <span>3</span>
                </div>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill red" style={{ width: '12.5%' }}></div>
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-label-row">
                  <span>Aktif Randevu</span>
                  <span>3</span>
                </div>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill purple" style={{ width: '12.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
