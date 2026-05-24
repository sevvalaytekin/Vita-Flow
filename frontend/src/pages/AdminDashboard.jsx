import React, { useState } from 'react';
import { Building2, Users, Stethoscope, BarChart3, Activity, AlertTriangle, TrendingUp, Clock, Plus, Search } from 'lucide-react';
import '../styles/admin.css';

const MOCK_HOSPITALS = [
  { id: 1, name: 'Acıbadem Maslak Hastanesi', capacity: 120, occupancy: 87, emergency: 25, status: 'active' },
  { id: 2, name: 'American Hospital', capacity: 95, occupancy: 62, emergency: 18, status: 'active' },
  { id: 3, name: 'Liv Hospital Ulus', capacity: 80, occupancy: 71, emergency: 15, status: 'active' },
  { id: 4, name: 'Memorial Şişli', capacity: 150, occupancy: 103, emergency: 30, status: 'active' },
  { id: 5, name: 'Florence Nightingale', capacity: 110, occupancy: 45, emergency: 12, status: 'maintenance' },
];

const MOCK_STATS = {
  totalHospitals: 5,
  totalDoctors: 127,
  totalUsers: 3482,
  activeAppointments: 856,
  cancelRate: 8.2,
  avgWaitTime: '14 dk',
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = MOCK_HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Yönetim Paneli</h1>
          <p className="page-subtitle">Sistem yönetimi ve raporlama merkezi</p>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Building2 size={22} color="#2563eb" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{MOCK_STATS.totalHospitals}</span>
            <span className="stat-label">Hastane</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <Stethoscope size={22} color="#16a34a" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{MOCK_STATS.totalDoctors}</span>
            <span className="stat-label">Doktor</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Users size={22} color="#d97706" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{MOCK_STATS.totalUsers.toLocaleString()}</span>
            <span className="stat-label">Kullanıcı</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>
            <BarChart3 size={22} color="#db2777" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{MOCK_STATS.activeAppointments}</span>
            <span className="stat-label">Aktif Randevu</span>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="admin-metrics-row">
        <div className="metric-card warning">
          <AlertTriangle size={18} />
          <span>İptal Oranı: <strong>%{MOCK_STATS.cancelRate}</strong></span>
        </div>
        <div className="metric-card info">
          <Clock size={18} />
          <span>Ort. Bekleme: <strong>{MOCK_STATS.avgWaitTime}</strong></span>
        </div>
        <div className="metric-card success">
          <TrendingUp size={18} />
          <span>Günlük Randevu: <strong>+124</strong></span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
          Hastaneler
        </button>
        <button className={`tab-btn ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
          Kullanıcılar
        </button>
        <button className={`tab-btn ${activeSection === 'reports' ? 'active' : ''}`} onClick={() => setActiveSection('reports')}>
          Raporlar
        </button>
      </div>

      <div className="tab-content glass-panel">
        {activeSection === 'overview' && (
          <div className="admin-section fade-in">
            <div className="section-header">
              <h3>Hastane Yönetimi</h3>
              <div className="section-actions">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Hastane ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-primary btn-sm">
                  <Plus size={16} /> Hastane Ekle
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hastane Adı</th>
                    <th>Kapasite</th>
                    <th>Doluluk</th>
                    <th>Acil Kapasite</th>
                    <th>Doluluk %</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map(h => {
                    const pct = Math.round((h.occupancy / h.capacity) * 100);
                    return (
                      <tr key={h.id}>
                        <td className="hospital-name-cell">
                          <Building2 size={16} />
                          {h.name}
                        </td>
                        <td>{h.capacity}</td>
                        <td>{h.occupancy}</td>
                        <td>{h.emergency}</td>
                        <td>
                          <div className="occupancy-bar-wrapper">
                            <div className="occupancy-bar" style={{
                              width: `${pct}%`,
                              background: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e'
                            }} />
                            <span>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${h.status}`}>
                            {h.status === 'active' ? 'Aktif' : 'Bakım'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="admin-section fade-in">
            <div className="section-header">
              <h3>Kullanıcı Yönetimi</h3>
            </div>
            <p className="placeholder-text">Kullanıcı yönetim paneli burada yer alacak. Rol atama, kullanıcı arama ve düzenleme işlemleri.</p>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="admin-section fade-in">
            <div className="section-header">
              <h3>Raporlar & Metrikler</h3>
            </div>
            <p className="placeholder-text">Günlük/haftalık/aylık raporlar: En yoğun acil servisler, boş kapasite kullanım oranı, randevu iptal ve yeniden tahsis oranı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
